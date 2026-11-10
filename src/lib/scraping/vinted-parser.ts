/**
 * Parser Inteligente para HTML do Vinted
 * 
 * Estratégias:
 * 1. Jina AI / Markdown text (NOVO - mais confiável)
 * 2. __NEXT_DATA__ - dados do React/Vite do Vinted
 * 3. JSON-LD - se disponível
 * 4. Meta tags / Regex fallback
 */

interface VintedItem {
  id: number;
  title: string;
  images: { url: string; full_size_url: string; thumbnails: string[] };
  price: { amount: string; currency_code: 'EUR' };
  discount: number | null;
  brand_title: string;
  size_title: string;
  status: string; // 'new_with_tags', 'very_good', 'good', 'satisfactory'
  user: { id: number; login: string; feedback_reputation: number };
  service_fee: { amount: string; currency_code: 'EUR' };
  total_price: { amount: string; currency_code: 'EUR' };
}

function extractFromJinaAIText(text: string): VintedItem | null {
  try {
    // Jina AI retorna:
    // Title: ... (metadata)
    // URL Source: ...
    // Final URL: ...
    // Markdown Content:
    // [real markdown content starts here]
    // # Título do Produto
    // ...
    
    // Extrai apenas o conteúdo após "Markdown Content:"
    let markdownContent = text;
    const markdownStart = text.indexOf('Markdown Content:');
    if (markdownStart !== -1) {
      markdownContent = text.substring(markdownStart + 'Markdown Content:'.length);
    }
    
    const lines = markdownContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Procura pelo título (linha que começa com # )
    let title = '';
    for (const line of lines) {
      if (line.startsWith('# ') && !line.startsWith('## ')) {
        title = line.substring(2).trim();
        break;
      }
    }
    
    // Se não achou no formato #, procura na URL final
    if (!title) {
      const urlMatch = text.match(/Final URL: https:\/\/[^\/]+\/items\/\d+-([^\n]+)/);
      if (urlMatch?.[1]) {
        title = urlMatch[1].replace(/-/g, ' ');
      }
    }
    
    // Extrai preço (formato: 50,00€ ou 50.00 €)
    let priceStr = '';
    for (const line of lines) {
      // Procura padrão de preço: dígitos + vírgula/ponto + €
      const priceMatch = line.match(/^([\d,.]+)\s*€/);
      if (priceMatch) {
        // Ignora "Frais Vinted inclus" que vem depois do preço principal
        const value = priceMatch[1].replace(',', '.');
        if (parseFloat(value) > 0) {
          priceStr = value;
          break;
        }
      }
    }
    
    // Extrai imagens (prioriza URLs do Vinted)
    const imageUrls: string[] = [];
    const imgRegex = /!\[Image \d+: [^\]]*\]\((https:\/\/images[0-9]\.vinted\.net\/[^)]+)\)/g;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(markdownContent)) !== null) {
      imageUrls.push(imgMatch[1]);
    }
    
    // Extrai detalhes estruturados (Tamanho, Estado, Marca, Cor)
    let size = '';
    let condition = '';
    let brand = '';
    let color = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
      
      // Tamanho
      if (line === 'Taille' || line === 'Tamanho' || line === 'Size') {
        size = nextLine;
      }
      // Estado/Condição
      else if (line === 'État' || line === 'Estado' || line === 'Condition') {
        condition = nextLine;
      }
      // Marca
      else if (line === 'Marque' || line === 'Marca' || line === 'Brand') {
        brand = nextLine.replace(/^\[.*\]\(.*\)/, '').trim(); // Remove link markdown
      }
      // Cor
      else if (line === 'Couleur' || line === 'Cor' || line === 'Color') {
        color = nextLine;
      }
    }
    
    // Fallback: tenta extrair da linha que tem "·" (ex: "XL / 42 / 14·Neuf sans étiquette·[Zara]")
    if (!size || !condition || !brand) {
      const detailLine = lines.find(l => l.includes('·') && (l.includes('/') || l.includes('Neuf') || l.includes('Nouveau')));
      if (detailLine) {
        const parts = detailLine.split('·').map(p => p.trim());
        if (!size && parts[0]) size = parts[0];
        if (!condition && parts[1]) condition = parts[1];
        if (!brand && parts[2]) brand = parts[2].replace(/^\[(.*)\]\(.*\)$/, '$1');
      }
    }
    
    // Normaliza condição
    const conditionMap: Record<string, string> = {
      'nouveau avec étiquette': 'new_with_tags',
      'nouveau sans étiquette': 'new_without_tags',
      'neuf sans étiquette': 'new_without_tags',
      'neuf avec étiquette': 'new_with_tags',
      'très bon état': 'very_good',
      'tres bon etat': 'very_good',
      'bon état': 'good',
      'etat satisfaisant': 'satisfactory',
      'muito bom': 'very_good',
      'bom': 'good',
      'satisfatório': 'satisfactory',
      'novo com etiqueta': 'new_with_tags',
      'novo sem etiqueta': 'new_without_tags',
    };
    
    const normalizedCondition = condition.toLowerCase();
    const status = conditionMap[normalizedCondition] || 'new_with_tags';
    
    // Se não encontrou nada útil, retorna null
    if (!title && !priceStr) {
      return null;
    }
    
    // Prepara imagens
    const thumbnails = imageUrls.filter(url => url.includes('vinted.net'));
    const fullSize = thumbnails.map(url => url.replace('/310x430/', '/f800/').replace('/190x260/', '/f800/'));
    
    return {
      id: 0, // Será preenchido pelo caller
      title: title || 'Item Vinted',
      images: {
        url: fullSize[0] || thumbnails[0] || '',
        full_size_url: fullSize[0] || thumbnails[0] || '',
        thumbnails,
      },
      price: { 
        amount: priceStr || '0', 
        currency_code: 'EUR' 
      },
      discount: null,
      brand_title: brand || 'Sem marca',
      size_title: size || '',
      status,
      user: { id: 0, login: '', feedback_reputation: 0 },
      service_fee: { amount: '0', currency_code: 'EUR' },
      total_price: { amount: '0', currency_code: 'EUR' },
    };
  } catch (error: any) {
    console.warn('[Vinted Parser] Erro ao extrair de texto Jina AI:', error.message);
    return null;
  }
}

function extractVintedNextData(html: string): any {
  try {
    // Vinted usa __NEXT_DATA__ do Next.js
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (match?.[1]) {
      const data = JSON.parse(match[1]);
      
      // Navega pela estrutura de dados do Vinted
      const item = data?.props?.pageProps?.item;
      if (item) {
        return {
          id: item.id,
          title: item.title,
          photo: item.photo,
          price: item.price,
          discount: item.discount,
          brand_title: item.brand_title,
          size_title: item.size_title,
          status: item.status,
          user: item.user,
          service_fee: item.service_fee,
          total_price: item.total_price,
        };
      }
    }
  } catch (error: any) {
    console.warn('[Vinted Parser] Erro ao extrair __NEXT_DATA__:', error.message);
  }
  return null;
}

function extractFromMetaTags(html: string): Partial<VintedItem> {
  const result: Partial<VintedItem> = {};
  
  // Open Graph tags
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  if (ogTitle?.[1]) {
    result.title = ogTitle[1];
  }
  
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  if (ogImage?.[1]) {
    result.images = {
      url: ogImage[1],
      full_size_url: ogImage[1],
      thumbnails: [ogImage[1]],
    };
  }
  
  // Vinted-specific meta tags
  const priceMatch = html.match(/<meta[^>]*name=["']price["'][^>]*content=["']([^"']*)["']/i);
  if (priceMatch?.[1]) {
    result.price = {
      amount: priceMatch[1],
      currency_code: 'EUR',
    };
  }
  
  return result;
}

function extractFromJsonLd(html: string): Partial<VintedItem> {
  try {
    const scriptTags = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    
    for (const tag of scriptTags) {
      const match = tag.match(/<script[^>]*>([\s\S]*)<\/script>/i);
      if (match?.[1]) {
        const ld = JSON.parse(match[1]);
        
        if (ld['@type'] === 'Product') {
          return {
            title: ld.name,
            price: ld.price ? { amount: String(ld.price.price), currency_code: ld.price.currency } : undefined,
            images: ld.image ? {
              url: ld.image,
              full_size_url: ld.image,
              thumbnails: Array.isArray(ld.image) ? ld.image : [ld.image],
            } : undefined,
          };
        }
      }
    }
  } catch {
    // Ignora
  }
  return {};
}

export function parseVintedHtml(html: string, itemId: string): VintedItem | null {
  if (!html || html.length < 100) {
    console.warn('[Vinted Parser] HTML muito curto, ignorando');
    return null;
  }

  try {
    // NOVO: Tenta detectar se é texto do Jina AI (markdown)
    const isJinaAI = html.includes('![') && html.includes('](') && !html.includes('<html');
    if (isJinaAI) {
      const jinaResult = extractFromJinaAIText(html);
      if (jinaResult) {
        jinaResult.id = parseInt(itemId);
        console.log(`[Vinted Parser] Produto extraído via Jina AI: ${jinaResult.title}`);
        return jinaResult;
      }
    }
    
    // Tenta __NEXT_DATA__ primeiro (para HTML real)
    const nextData = extractVintedNextData(html);
    if (nextData) {
      console.log(`[Vinted Parser] Produto extraído via __NEXT_DATA__: ${nextData.title}`);
      return nextData;
    }

    // Fallback 1: JSON-LD
    const jsonLd = extractFromJsonLd(html);
    if (jsonLd.title) {
      console.log(`[Vinted Parser] Produto extraído via JSON-LD: ${jsonLd.title}`);
      return {
        id: parseInt(itemId),
        title: jsonLd.title || 'Item Vinted',
        images: jsonLd.images || { url: '', full_size_url: '', thumbnails: [] },
        price: jsonLd.price || { amount: '0', currency_code: 'EUR' },
        discount: null,
        brand_title: '',
        size_title: '',
        status: 'new_with_tags',
        user: { id: 0, login: '', feedback_reputation: 0 },
        service_fee: { amount: '0', currency_code: 'EUR' },
        total_price: { amount: '0', currency_code: 'EUR' },
      };
    }

    // Fallback 2: Meta tags
    const meta = extractFromMetaTags(html);
    if (meta.title) {
      console.log(`[Vinted Parser] Produto extraído via meta tags: ${meta.title}`);
      return {
        id: parseInt(itemId),
        title: meta.title,
        images: meta.images || { url: '', full_size_url: '', thumbnails: [] },
        price: meta.price || { amount: '0', currency_code: 'EUR' },
        discount: null,
        brand_title: '',
        size_title: '',
        status: 'new_with_tags',
        user: { id: 0, login: '', feedback_reputation: 0 },
        service_fee: { amount: '0', currency_code: 'EUR' },
        total_price: { amount: '0', currency_code: 'EUR' },
      };
    }

    console.warn('[Vinted Parser] Não foi possível extrair dados do HTML');
    return null;
  } catch (error: any) {
    console.error('[Vinted Parser] Erro ao parsear HTML:', error.message);
    return null;
  }
}
