import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products, productImages, productVariants, categories } from '../../src/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import sharp from 'sharp';
import { createWriteStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// ============================================
// CATEGORIAS DE INTERESSE PARA ANGOLA
// ============================================
const TARGET_CATEGORIES = [
  // Vinted - Tech (iPhones, MacBooks, etc.)
  { platform: 'VINTED', category: 'Tech', searchTerms: ['iphone 13', 'iphone 14', 'iphone 15', 'macbook air m1', 'macbook air m2', 'ipad', 'airpods', 'apple watch'] },
  { platform: 'VINTED', category: 'Moda', searchTerms: ['vestido midi', 'blazer', 'tenis nike', 'tenis adidas', 'bolsa couro', 'jaqueta jeans'] },
  { platform: 'VINTED', category: 'Calcados', searchTerms: ['nike air force', 'nike air max', 'adidas ultraboost', 'yeezy', 'jordan'] },
  
  // AliExpress - Gadgets & Tech
  { platform: 'ALIEXPRESS', category: 'Tech', searchTerms: ['smartwatch', 'fone bluetooth', 'carregador gan', 'power bank', 'ssd nvme', 'teclado mecanico'] },
  { platform: 'ALIEXPRESS', category: 'Casa', searchTerms: ['aspirador robô', 'purificador ar', 'lampada inteligente', 'camara wifi'] },
  { platform: 'ALIEXPRESS', category: 'Beleza', searchTerms: ['secador cabelo', 'chapinha', 'depilador', 'massageador'] },
];

// ============================================
// HELPERS
// ============================================
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 180);
}

function generateSlug(name, externalId, platform) {
  const base = `${platform.toLowerCase()}-${slugify(name)}`;
  const suffix = externalId.slice(-6);
  return `${base}-${suffix}`.substring(0, 200);
}

async function downloadImage(imageUrl, localPath) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    if (!response.ok) return false;
    
    const buffer = await response.buffer();
    
    // Otimizar com Sharp (WebP, max 800px width)
    const optimized = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    
    await writeFile(localPath, optimized);
    return true;
  } catch (error) {
    console.error(`[ImageDownload] Falha ${imageUrl}:`, error.message);
    return false;
  }
}

async function ensureCategory(name, slug) {
  let cat = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (cat.length > 0) return cat[0].id;
  
  const inserted = await db.insert(categories).values({ name, slug }).returning({ id: categories.id });
  return inserted[0].id;
}

// ============================================
// VINTED SCRAPER (via Jina AI - grátis e confiável)
// ============================================
async function scrapeVintedSearch(searchTerm, maxResults = 20) {
  console.log(`[Vinted] Buscando: "${searchTerm}"`);
  
  // Usar Jina AI para extrair resultados de busca
  const searchUrl = `https://www.vinted.pt/vetements?search_text=${encodeURIComponent(searchTerm)}&order=newest_first`;
  const jinaUrl = `https://r.jina.ai/http://${searchUrl.replace('https://', '')}`;
  
  try {
    const response = await fetch(jinaUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImportEasy/1.0)' },
      timeout: 20000
    });
    
    if (!response.ok) throw new Error(`Jina AI: ${response.status}`);
    
    const text = await response.text();
    
    // Parsear resultados do Jina AI
    const items = parseVintedSearchResults(text, searchTerm);
    return items.slice(0, maxResults);
  } catch (error) {
    console.error(`[Vinted] Erro busca "${searchTerm}":`, error.message);
    return [];
  }
}

function parseVintedSearchResults(text, searchTerm) {
  const items = [];
  const lines = text.split('\n');
  
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detectar novo item (padrão do Jina AI para Vinted)
    if (trimmed.match(/^\d+\.\s/)) {
      if (currentItem && currentItem.title && currentItem.price) {
        items.push(currentItem);
      }
      currentItem = { title: '', price: '', url: '', image: '', brand: '', size: '', condition: '' };
      
      // Extrair título
      const titleMatch = trimmed.match(/^\d+\.\s*(.+?)(?:\s*[-|]\s*|$)/);
      if (titleMatch) currentItem.title = titleMatch[1].trim();
    }
    
    if (!currentItem) continue;
    
    // Preço
    if (trimmed.match(/^€\s*\d+/) || trimmed.match(/^\d+[,.]\d+\s*€/)) {
      currentItem.price = trimmed;
    }
    
    // URL do item
    if (trimmed.includes('vinted.pt/items/') || trimmed.includes('vinted.pt/item/')) {
      const urlMatch = trimmed.match(/https?:\/\/[^\s]+/);
      if (urlMatch) currentItem.url = urlMatch[0];
    }
    
    // Imagem
    if (trimmed.match(/^!\[.*\]\(https?:\/\/[^)]+\)$/)) {
      const imgMatch = trimmed.match(/\((https?:\/\/[^)]+)\)/);
      if (imgMatch) currentItem.image = imgMatch[1];
    }
  }
  
  if (currentItem && currentItem.title && currentItem.price) {
    items.push(currentItem);
  }
  
  return items.filter(item => item.title && item.price && item.url);
}

async function scrapeVintedProduct(itemUrl) {
  const jinaUrl = `https://r.jina.ai/http://${itemUrl.replace('https://', '')}`;
  
  try {
    const response = await fetch(jinaUrl, { timeout: 20000 });
    if (!response.ok) throw new Error(`Jina AI: ${response.status}`);
    
    const text = await response.text();
    return parseVintedProductDetails(text, itemUrl);
  } catch (error) {
    console.error(`[Vinted] Erro produto ${itemUrl}:`, error.message);
    return null;
  }
}

function parseVintedProductDetails(text, url) {
  const lines = text.split('\n');
  
  const result = {
    title: '',
    price: 0,
    currency: 'EUR',
    description: '',
    brand: '',
    size: '',
    condition: '',
    images: [],
    externalId: '',
  };
  
  // Extrair ID do Vinted da URL
  const idMatch = url.match(/items?\/(\d+)/);
  if (idMatch) result.externalId = idMatch[1];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Título (primeira linha significativa)
    if (!result.title && trimmed.length > 10 && !trimmed.startsWith('![') && !trimmed.startsWith('[')) {
      result.title = trimmed;
    }
    
    // Preço
    const priceMatch = trimmed.match(/€\s*(\d+[,.]?\d*)/);
    if (priceMatch && !result.price) {
      result.price = parseFloat(priceMatch[1].replace(',', '.'));
    }
    
    // Imagens
    if (trimmed.match(/!\[.*\]\(https?:\/\/[^)]+\.(?:jpg|jpeg|png|webp)[^)]*\)/i)) {
      const imgMatch = trimmed.match(/\((https?:\/\/[^)]+)\)/);
      if (imgMatch && !result.images.includes(imgMatch[1])) {
        result.images.push(imgMatch[1]);
      }
    }
    
    // Marca
    if (trimmed.toLowerCase().startsWith('brand:') || trimmed.toLowerCase().startsWith('marca:')) {
      result.brand = trimmed.split(':')[1]?.trim() || '';
    }
    
    // Tamanho
    if (trimmed.toLowerCase().startsWith('size:') || trimmed.toLowerCase().startsWith('tamanho:')) {
      result.size = trimmed.split(':')[1]?.trim() || '';
    }
    
    // Condição
    if (trimmed.toLowerCase().startsWith('condition:') || trimmed.toLowerCase().startsWith('estado:')) {
      result.condition = trimmed.split(':')[1]?.trim() || '';
    }
  }
  
  return result.title && result.price > 0 ? result : null;
}

// ============================================
// ALIEXPRESS SCRAPER (via RapidAPI gratuito + Jina AI fallback)
// ============================================
async function scrapeAliExpressSearch(searchTerm, maxResults = 15) {
  console.log(`[AliExpress] Buscando: "${searchTerm}"`);
  
  // Tentar RapidAPI primeiro (se configurado)
  if (process.env.RAPIDAPI_KEY) {
    try {
      return await scrapeAliExpressRapidAPI(searchTerm, maxResults);
    } catch (error) {
      console.warn('[AliExpress] RapidAPI falhou, tentando Jina AI:', error.message);
    }
  }
  
  // Fallback: Jina AI em página de busca
  const searchUrl = `https://pt.aliexpress.com/w/wholesale-${encodeURIComponent(searchTerm)}.html`;
  const jinaUrl = `https://r.jina.ai/http://${searchUrl.replace('https://', '')}`;
  
  try {
    const response = await fetch(jinaUrl, { timeout: 25000 });
    if (!response.ok) throw new Error(`Jina AI: ${response.status}`);
    
    const text = await response.text();
    return parseAliExpressSearchResults(text, searchTerm).slice(0, maxResults);
  } catch (error) {
    console.error(`[AliExpress] Erro busca "${searchTerm}":`, error.message);
    return [];
  }
}

async function scrapeAliExpressRapidAPI(searchTerm, maxResults) {
  const url = `https://aliexpress-data-api.p.rapidapi.com/search?keywords=${encodeURIComponent(searchTerm)}&page=1&sort=orders&minPrice=1&maxPrice=500`;
  
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'aliexpress-data-api.p.rapidapi.com'
    },
    timeout: 15000
  });
  
  if (!response.ok) throw new Error(`RapidAPI: ${response.status}`);
  
  const data = await response.json();
  const items = data.data?.products || data.products || [];
  
  return items.slice(0, maxResults).map((item) => ({
    title: item.productTitle || item.title,
    price: parseFloat(item.salePrice || item.price || item.minPrice),
    originalPrice: parseFloat(item.originalPrice || item.maxPrice),
    currency: 'USD',
    image: item.productImage || item.imageUrl,
    url: `https://www.aliexpress.com/item/${item.productId}.html`,
    externalId: String(item.productId),
    orders: item.orders || item.tradeCount || 0,
    rating: item.rating || 0,
    shipping: item.shipping || 'Free',
  })).filter((item) => item.title && item.price > 0);
}

function parseAliExpressSearchResults(text, searchTerm) {
  const items = [];
  const lines = text.split('\n');
  
  let currentItem = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detectar produto (padrão Jina AI)
    if (trimmed.match(/^[\d\$€]\s/) || (trimmed.includes('$') && trimmed.match(/\d/))) {
      if (currentItem && currentItem.title && currentItem.price) {
        items.push(currentItem);
      }
      currentItem = { title: '', price: 0, currency: 'USD', image: '', url: '', externalId: '' };
    }
    
    if (!currentItem) continue;
    
    // Título
    if (!currentItem.title && trimmed.length > 15 && !trimmed.startsWith('![') && !trimmed.startsWith('[') && !trimmed.match(/^\d/)) {
      currentItem.title = trimmed;
    }
    
    // Preço
    const priceMatch = trimmed.match(/[\$€]\s*(\d+[,.]?\d*)/);
    if (priceMatch && !currentItem.price) {
      currentItem.price = parseFloat(priceMatch[1].replace(',', '.'));
      currentItem.currency = trimmed.includes('€') ? 'EUR' : 'USD';
    }
    
    // Imagem
    if (trimmed.match(/!\[.*\]\(https?:\/\/[^)]+\.(?:jpg|jpeg|png|webp)[^)]*\)/i)) {
      const imgMatch = trimmed.match(/\((https?:\/\/[^)]+)\)/);
      if (imgMatch && !currentItem.image) currentItem.image = imgMatch[1];
    }
    
    // URL
    if (trimmed.includes('aliexpress.com/item/')) {
      const urlMatch = trimmed.match(/https?:\/\/[^\s]+/);
      if (urlMatch) currentItem.url = urlMatch[0];
      
      const idMatch = urlMatch?.[0].match(/item\/(\d+)/);
      if (idMatch) currentItem.externalId = idMatch[1];
    }
  }
  
  if (currentItem && currentItem.title && currentItem.price) {
    items.push(currentItem);
  }
  
  return items.filter(item => item.title && item.price > 0 && item.url);
}

// ============================================
// SALVAR PRODUTO NO BANCO
// ============================================
async function saveProductToDB(productData, platform, categorySlug) {
  const categoryId = await ensureCategory(
    platform === 'VINTED' ? 'Vinted ' + categorySlug : 'AliExpress ' + categorySlug,
    `${platform.toLowerCase()}-${categorySlug.toLowerCase()}`
  );
  
  const slug = generateSlug(productData.title, productData.externalId || String(Date.now()), platform);
  
  // Verificar se já existe
  const existing = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (existing.length > 0) {
    // Atualizar preço se mudou
    const newPrice = productData.price;
    if (Math.abs(Number(existing[0].originalPrice || 0) - newPrice) > 0.01) {
      await db.update(products)
        .set({ 
          originalPrice: newPrice.toFixed(2),
          lastPriceCheckAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(products.id, existing[0].id));
      console.log(`[DB] Preço atualizado: ${slug} = ${newPrice} ${productData.currency}`);
    }
    return existing[0].id;
  }
  
  // Baixar imagem principal
  let localImagePath = null;
  if (productData.image) {
    const imagesDir = join(process.cwd(), 'public', 'images', 'scraped', platform.toLowerCase());
    await mkdir(imagesDir, { recursive: true });
    
    const filename = `${slug}.webp`;
    const filepath = join(imagesDir, filename);
    
    const success = await downloadImage(productData.image, filepath);
    if (success) {
      localImagePath = `/images/scraped/${platform.toLowerCase()}/${filename}`;
    }
  }
  
  // Inserir produto
  const inserted = await db.insert(products).values({
    externalProductId: productData.externalId || null,
    sourceUrl: productData.url,
    source: platform,
    name: productData.title,
    slug,
    description: productData.description || `Produto importado da ${platform}: ${productData.title}`,
    categoryId,
    originalPrice: productData.price.toFixed(2),
    currency: productData.currency || (platform === 'VINTED' ? 'EUR' : 'USD'),
    availability: 'IN_STOCK',
    status: 'ACTIVE',
    defaultImage: localImagePath,
    weightGrams: estimateWeight(platform, productData.category || ''),
    sku: `IMP-${platform}-${productData.externalId || slug.slice(-8)}`,
  }).returning({ id: products.id });
  
  const productId = inserted[0].id;
  
  // Salvar imagens adicionais
  if (productData.images && productData.images.length > 0) {
    const imagesDir = join(process.cwd(), 'public', 'images', 'scraped', platform.toLowerCase());
    await mkdir(imagesDir, { recursive: true });
    
    for (let i = 0; i < Math.min(productData.images.length, 5); i++) {
      const imgUrl = productData.images[i];
      const filename = `${slug}-${i + 1}.webp`;
      const filepath = join(imagesDir, filename);
      
      const success = await downloadImage(imgUrl, filepath);
      if (success) {
        await db.insert(productImages).values({
          productId,
          url: `/images/scraped/${platform.toLowerCase()}/${filename}`,
          altText: `${productData.title} - imagem ${i + 1}`,
          position: i + 1,
        });
      }
    }
  }
  
  // Criar variante padrão
  await db.insert(productVariants).values({
    productId,
    color: productData.color || 'Único',
    size: productData.size || 'Único',
    sku: `IMP-${platform}-${productData.externalId || slug.slice(-8)}-DEF`,
    priceModifier: '0',
    stockQuantity: 10,
    available: true,
    imageUrl: localImagePath,
  });
  
  console.log(`[DB] Novo produto: ${slug} (${platform}) - ${productData.price} ${productData.currency}`);
  return productId;
}

function estimateWeight(platform, category) {
  if (category.includes('Tech') || category.includes('Tech')) return 300;
  if (category.includes('Calcados') || category.includes('Sapatos')) return 800;
  if (category.includes('Bolsa') || category.includes('Mochila')) return 500;
  if (category.includes('Vestido') || category.includes('Roupa')) return 300;
  return 400;
}

// ============================================
// MAIN SCRAPER FUNCTION
// ============================================
export async function runDailyScraper(options = {}) {
  const { test = false, maxPerCategory = test ? 3 : 20 } = options;
  const startTime = Date.now();
  
  console.log(`[Scraper] Iniciando scraper diário ${test ? '(MODO TESTE)' : ''}`);
  console.log(`[Scraper] Categorias alvo: ${TARGET_CATEGORIES.length}`);
  
  let totalNew = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  
  for (const target of TARGET_CATEGORIES) {
    console.log(`\n[Scraper] === ${target.platform} - ${target.category} ===`);
    
    for (const searchTerm of target.searchTerms) {
      try {
        let items = [];
        
        if (target.platform === 'VINTED') {
          items = await scrapeVintedSearch(searchTerm, maxPerCategory);
          
          // Para cada item, buscar detalhes completos
          for (const item of items) {
            if (!item.url) continue;
            
            const details = await scrapeVintedProduct(item.url);
            if (details) {
              Object.assign(item, details);
            }
            
            // Pequeno delay para não sobrecarregar
            await new Promise(r => setTimeout(r, 500));
          }
        } else if (target.platform === 'ALIEXPRESS') {
          items = await scrapeAliExpressSearch(searchTerm, maxPerCategory);
        }
        
        // Salvar no banco
        for (const item of items) {
          if (!item.title || !item.price || item.price <= 0) continue;
          
          try {
            const result = await saveProductToDB(item, target.platform, target.category);
            if (result) totalNew++;
          } catch (dbError) {
            console.error(`[DB] Erro salvando ${item.title}:`, dbError.message);
            totalErrors++;
          }
        }
        
        console.log(`[Scraper] "${searchTerm}": ${items.length} itens processados`);
        
        // Delay entre buscas
        await new Promise(r => setTimeout(r, 1000));
        
      } catch (error) {
        console.error(`[Scraper] Erro em "${searchTerm}":`, error.message);
        totalErrors++;
      }
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[Scraper] Concluído em ${duration}s`);
  console.log(`[Scraper] Novos: ${totalNew} | Erros: ${totalErrors}`);
  
  return { success: true, newProducts: totalNew, errors: totalErrors, duration: `${duration}s` };
}

// ============================================
// HTTP HANDLER (para Neon Function)
// ============================================
export default async function handler(req) {
  const url = new URL(req.url);
  const testMode = url.searchParams.get('test') === 'true';
  
  // Verificar autenticação (simple token check para cron)
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.SCRAPER_CRON_TOKEN;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  
  try {
    const result = await runDailyScraper({ test: testMode });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Scraper] Erro fatal:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Para teste local
if (import.meta.url === `file://${process.argv[1]}`) {
  runDailyScraper({ test: process.argv.includes('--test') })
    .then(result => {
      console.log('Resultado:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('Falha:', err);
      process.exit(1);
    });
}
