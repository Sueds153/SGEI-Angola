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
    
    // Se não achou no formato #, procura no cabeçalho "Title:" do Jina AI
    if (!title) {
      const titleHeaderMatch = text.match(/^Title:\s*(.+?)(?:\s*-\s*Vinted)?$/im);
      if (titleHeaderMatch?.[1]) {
        title = titleHeaderMatch[1].trim();
      }
    }

    // Se ainda não achou, procura na URL final
    if (!title) {
      const urlMatch = text.match(/Final URL: https:\/\/[^\/]+\/items\/\d+-([^\n]+)/);
      if (urlMatch?.[1]) {
        title = urlMatch[1].replace(/-/g, ' ');
      }
    }
    
    // Extrai preço base e preço com taxa de proteção do comprador
    let priceStr = '';
    let totalPriceStr = '';
    let serviceFeeStr = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detecta linha explícita de proteção: ex "11,20€incl. taxa Vinted", "11.20 € incl. Frais Vinted", etc.
      const protectedMatch = line.match(/^([\d,.]+)\s*€?\s*(?:incl|com\s+prote|frais|taxa|protection|buyer)/i) ||
                             line.match(/^([\d,.]+)\s*€\s*incl/i);
      if (protectedMatch && !totalPriceStr) {
        const val = protectedMatch[1].replace(',', '.');
        if (parseFloat(val) > 0) {
          totalPriceStr = parseFloat(val).toFixed(2);
        }
      }

      // Procura padrão de preço base: dígitos + vírgula/ponto + €
      const priceMatch = line.match(/^([\d,.]+)\s*€/);
      if (priceMatch && !priceStr) {
        // Se a linha tem "incl" ou "taxa", guardamos como total com proteção
        if (/incl|taxa|frais|prote/i.test(line)) {
          if (!totalPriceStr) {
            totalPriceStr = parseFloat(priceMatch[1].replace(',', '.')).toFixed(2);
          }
        } else {
          const value = priceMatch[1].replace(',', '.');
          if (parseFloat(value) > 0) {
            priceStr = parseFloat(value).toFixed(2);
          }
        }
      }
    }

    // Se encontramos o preço base mas não o total com proteção, calcula pela fórmula oficial Vinted
    // Fórmula oficial Vinted: 0,70 € fixo + 5% do valor do artigo
    if (priceStr && !totalPriceStr) {
      const baseNum = parseFloat(priceStr);
      const fee = 0.70 + (baseNum * 0.05);
      serviceFeeStr = fee.toFixed(2);
      totalPriceStr = (baseNum + fee).toFixed(2);
    } else if (priceStr && totalPriceStr) {
      const baseNum = parseFloat(priceStr);
      const totalNum = parseFloat(totalPriceStr);
      if (totalNum > baseNum) {
        serviceFeeStr = (totalNum - baseNum).toFixed(2);
      } else {
        // Se totalPriceStr acabou igual ou menor, recalcula fórmula oficial
        const fee = 0.70 + (baseNum * 0.05);
        serviceFeeStr = fee.toFixed(2);
        totalPriceStr = (baseNum + fee).toFixed(2);
      }
    } else if (!priceStr && totalPriceStr) {
      // Se só encontrou o total com taxa, desconta a taxa
      const totalNum = parseFloat(totalPriceStr);
      const baseNum = Math.max(0, (totalNum - 0.70) / 1.05);
      priceStr = baseNum.toFixed(2);
      serviceFeeStr = (totalNum - baseNum).toFixed(2);
    }

    // Extrai imagens (captura robusta de URLs Vinted em qualquer formato markdown ou plain)
    const imageUrls: string[] = [];
    const imgRegex = /!\[([^\]]*)\]\((https:\/\/[^)]*(?:vinted\.(?:net|com)|vinted-media)[^)]+)\)/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(markdownContent)) !== null) {
      const u = imgMatch[2];
      if (
        !u.includes('buyer-protection') &&
        !u.includes('logo') &&
        !u.includes('facebook') &&
        !u.includes('instagram') &&
        !u.includes('linkedin') &&
        !u.includes('google-play') &&
        !u.includes('app-store') &&
        !imageUrls.includes(u)
      ) {
        imageUrls.push(u);
      }
    }

    // Fallback de imagens: busca URLs diretas do CDN da Vinted no texto todo
    if (imageUrls.length === 0) {
      const directUrlRegex = /(https:\/\/images[0-9]*\.vinted\.net\/t\/[^\s"')]+)/gi;
      let directMatch;
      while ((directMatch = directUrlRegex.exec(text)) !== null) {
        const u = directMatch[1];
        if (!imageUrls.includes(u)) {
          imageUrls.push(u);
        }
      }
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
    
    // Prepara imagens — agora usa imageUrls já filtradas de logos/ícones
    // Garante full-size (substitui tamanhos 310x430, 190x260, 820x1120 pelo /f800/)
    const thumbnails = imageUrls.filter(u => u.includes('vinted.net'));
    const fullSize = thumbnails.map(u =>
      u.replace(/\/\d+x\d+\//, '/f800/')
       .replace('/310x430/', '/f800/')
       .replace('/190x260/', '/f800/')
       .replace('/820x1120/', '/f800/')
    );

    // Se não encontrou imagens de produto, busca qualquer URL CDN Vinted restante no texto bruto
    if (thumbnails.length === 0) {
      const fallbackRegex = /(https:\/\/images[0-9]*\.vinted\.net\/[^\s"')\]]+\.(?:jpg|jpeg|webp|png)(?:\?[^\s"')\]]*)?)/gi;
      let fm: RegExpExecArray | null;
      while ((fm = fallbackRegex.exec(text)) !== null) {
        const u = fm[1];
        if (!thumbnails.includes(u)) thumbnails.push(u);
        const full = u.replace(/\/\d+x\d+\//, '/f800/');
        if (!fullSize.includes(full)) fullSize.push(full);
      }
    }

    return {
      id: 0, // Será preenchido pelo caller
      title: title || 'Item Vinted',
      images: {
        url: fullSize[0] || thumbnails[0] || '',
        full_size_url: fullSize[0] || thumbnails[0] || '',
        thumbnails: fullSize.length > 0 ? fullSize : thumbnails,
      },
      price: {
        amount: priceStr || '0',
        currency_code: 'EUR',
      },
      discount: null,
      brand_title: brand || 'Sem marca',
      size_title: size || '',
      status,
      user: { id: 0, login: '', feedback_reputation: 0 },
      // Taxa de proteção do comprador Vinted: 0,70€ + 5% do preço base (fórmula oficial)
      service_fee: { amount: serviceFeeStr || '0', currency_code: 'EUR' },
      total_price: { amount: totalPriceStr || priceStr || '0', currency_code: 'EUR' },
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
        const items = Array.isArray(ld) ? ld : [ld];
        
        for (const item of items) {
          if (item['@type'] === 'Product' || item['@type'] === 'IndividualProduct') {
            let extractedPrice: { amount: string; currency_code: 'EUR' } | undefined;

            if (item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              const p = parseFloat(String(offers.price || offers.lowPrice || '0'));
              if (p > 0) {
                extractedPrice = {
                  amount: p.toFixed(2),
                  currency_code: (offers.priceCurrency || 'EUR').toUpperCase() as 'EUR',
                };
              }
            } else if (item.price) {
              const p = typeof item.price === 'object' ? parseFloat(String(item.price.price || item.price.amount || '0')) : parseFloat(String(item.price));
              if (p > 0) {
                extractedPrice = {
                  amount: p.toFixed(2),
                  currency_code: 'EUR',
                };
              }
            }

            const images = item.image ? {
              url: Array.isArray(item.image) ? item.image[0] : (typeof item.image === 'string' ? item.image : item.image.url || ''),
              full_size_url: Array.isArray(item.image) ? item.image[0] : (typeof item.image === 'string' ? item.image : item.image.url || ''),
              thumbnails: Array.isArray(item.image) ? item.image : [typeof item.image === 'string' ? item.image : item.image.url || ''],
            } : undefined;

            const brand = item.brand?.name || (typeof item.brand === 'string' ? item.brand : '');

            return {
              title: item.name,
              price: extractedPrice,
              images,
              brand_title: brand,
            };
          }
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
    // Deteta se é texto do Jina AI (markdown) — mesmo sem imagens inline
    // O Jina AI retorna texto com "Title:", "URL Source:", "Final URL:" ou "Markdown Content:"
    // Ou texto simples sem tags HTML
    const isJinaAI = !html.includes('<html') && !html.includes('<!DOCTYPE') && (
      html.includes('Markdown Content:') ||
      html.includes('URL Source:') ||
      html.includes('Final URL:') ||
      html.includes('Title:') ||
      (html.includes('€') && !html.includes('<script'))
    );
    if (isJinaAI) {
      const jinaResult = extractFromJinaAIText(html);
      if (jinaResult) {
        jinaResult.id = parseInt(itemId);
        console.log(`[Vinted Parser] Produto extraído via Jina AI: ${jinaResult.title} (preço: ${jinaResult.price.amount} EUR)`);
        return jinaResult;
      }
      console.warn('[Vinted Parser] Jina AI text detetado mas sem dados extraíveis');
    }
    
    // Tenta __NEXT_DATA__ primeiro (para HTML real)
    const nextData = extractVintedNextData(html);
    if (nextData) {
      console.log(`[Vinted Parser] Produto extraído via __NEXT_DATA__: ${nextData.title}`);
      return nextData;
    }

    // Fallback 1: JSON-LD
    const jsonLd = extractFromJsonLd(html);
    if (jsonLd.title && jsonLd.price && parseFloat(jsonLd.price.amount) > 0) {
      console.log(`[Vinted Parser] Produto extraído via JSON-LD: ${jsonLd.title}`);
      const baseNum = parseFloat(jsonLd.price.amount);
      const fee = Number((0.70 + baseNum * 0.05).toFixed(2));
      const totalNum = Number((baseNum + fee).toFixed(2));

      return {
        id: parseInt(itemId),
        title: jsonLd.title || 'Item Vinted',
        images: jsonLd.images || { url: '', full_size_url: '', thumbnails: [] },
        price: jsonLd.price,
        discount: null,
        brand_title: jsonLd.brand_title || '',
        size_title: '',
        status: 'new_with_tags',
        user: { id: 0, login: '', feedback_reputation: 0 },
        service_fee: { amount: fee.toFixed(2), currency_code: 'EUR' },
        total_price: { amount: totalNum.toFixed(2), currency_code: 'EUR' },
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
