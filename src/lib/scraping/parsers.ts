/**
 * Parsers puros dos catálogos dos fornecedores.
 *
 * Recebem texto (markdown do Jina AI ou HTML da SHEIN) e devolvem anúncios
 * normalizados. Não fazem rede nem acedem à base de dados, pelo que podem ser
 * testados isoladamente.
 */

export type ScraperPlatform = "SHEIN" | "ALIEXPRESS" | "VINTED";

export interface Listing {
  title: string;
  price: number;
  currency: string;
  image: string | null;
  url: string;
  externalId: string;
}

export function toPrice(raw: string | undefined): number {
  if (!raw) return 0;
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function cleanTitle(raw: string): string {
  return raw
    .replace(/^Image\s+\d+:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 480);
}

/** Vinted: o markdown traz `![Image N: TÍTULO, Marca: …, 80.00 €](imagem)` e, perto, o link do artigo. */
export function parseVinted(markdown: string): Listing[] {
  const listings: Listing[] = [];
  const imageRe = /!\[Image \d+: ([^\]]+)\]\((https?:\/\/images\d*\.vinted\.net\/[^)\s]+)\)/g;

  let match: RegExpExecArray | null;
  while ((match = imageRe.exec(markdown)) !== null) {
    const alt = match[1];
    const image = match[2];
    const window = markdown.slice(match.index, match.index + 1200);
    const itemMatch = window.match(/https:\/\/www\.vinted\.[a-z.]+\/items\/(\d+)/);
    if (!itemMatch) continue;

    const externalId = itemMatch[1];
    const title = cleanTitle(alt.split(", Marca:")[0].split(", Estado:")[0]);
    const price = toPrice(alt.match(/(\d+[.,]\d{1,2})\s*€/)?.[1]);
    if (!title || title.length < 4 || price <= 0) continue;

    listings.push({
      title,
      price,
      currency: "EUR",
      image,
      url: `https://www.vinted.pt/items/${externalId}`,
      externalId,
    });
  }

  return listings;
}

/**
 * AliExpress: o bloco de cada anúncio traz a galeria de imagens (com o
 * título no texto alternativo), seguida de `### TÍTULO`, do preço em dólares/euros e do link do
 * artigo. Percorremos a galeria e recolhemos tudo o que pertence ao mesmo anúncio
 * dentro de uma janela curta de markdown.
 *
 * Formato típico observado no markdown do Jina AI:
 *   "$24.46$24.46 **$51.00**"  → sale=24.46, list=51.00
 *   "$1.09$1.09 $12.91$12.91 -91%" → sale=1.09, list=12.91 (new-buyer, rejected)
 *   "€15.99€15.99 **€29.99**" → sale=15.99, list=29.99 (EUR)
 *
 * Extração robusta: captura o par sale/list explícito ($sale$sale $list$list ou €sale€sale €list€list),
 * falha para o preço bold ($list ou €list) se o par não existir, e rejeita quando
 * sale < list * 0.25 (promoção de novo comprador não replicável).
 */
export function parseAliExpress(markdown: string): Listing[] {
  const listings: Listing[] = [];
  const seen = new Set<string>();

  const cardRe = /!\[Image \d+: ([^\]]{20,400})\]\((https:\/\/ae-pic[^)\s]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = cardRe.exec(markdown)) !== null) {
    const span = markdown.slice(match.index, match.index + 6000);
    const idMatch = span.match(/www\.aliexpress\.(?:us|com|pt)\/item\/(\d+)\.html/);
    if (!idMatch) continue;

    const externalId = idMatch[1];
    if (seen.has(externalId)) continue;

    const heading = span.match(/### ([^!\n]{10,400})/)?.[1];
    const title = cleanTitle((match[1] || heading || "").split(/\s·\s/)[0]);
    const image = match[2];

    // Tenta extrair par sale/list explícito: $12.34$12.34 $56.78$56.78 ou €12.34€12.34 €56.78€56.78
    const pairMatch = span.match(/([$€])\s*(\d+(?:[.,]\d{1,2})?)\s*\1\s*(\d+(?:[.,]\d{1,2})?)\s*\1\s*(\d+(?:[.,]\d{1,2})?)\s*\1/);
    let price = 0;
    let listPrice = 0;
    let currency = "USD";

    if (pairMatch) {
      // Formato: símbolo sale1 sale2 list1 list2 (ex: $1.09$1.09 $12.91$12.91)
      price = toPrice(pairMatch[2]);
      listPrice = toPrice(pairMatch[4]);
      currency = pairMatch[1] === "€" ? "EUR" : "USD";
    } else {
      // Fallback 1: preço bold (**$list** ou **€list**) + primeiro preço normal como sale
      const boldMatch = span.match(/\*\*([$€])\s?(\d+(?:[.,]\d{1,2})?)\*\*/);
      const firstPriceMatch = span.match(/### [\s\S]{0,1500}?([$€])\s?(\d+(?:[.,]\d{1,2})?)/);
      if (boldMatch && firstPriceMatch) {
        price = toPrice(firstPriceMatch[2]);
        listPrice = toPrice(boldMatch[2]);
        currency = boldMatch[1] === "€" ? "EUR" : "USD";
      } else if (boldMatch) {
        // Fallback 2: apenas preço bold disponível
        listPrice = toPrice(boldMatch[2]);
        price = listPrice;
        currency = boldMatch[1] === "€" ? "EUR" : "USD";
      } else if (firstPriceMatch) {
        // Fallback 3: apenas primeiro preço
        price = toPrice(firstPriceMatch[2]);
        currency = firstPriceMatch[1] === "€" ? "EUR" : "USD";
      }
    }

    // Rejeita preços de "novo comprador" (sale < 25% do listPrice) quando temos ambos
    if (listPrice > 0 && price > 0 && price < listPrice * 0.25) continue;

    if (!title || title.length < 6 || price <= 0) continue;

    seen.add(externalId);
    listings.push({
      title,
      price,
      currency,
      image,
      url: `https://www.aliexpress.com/item/${externalId}.html`,
      externalId,
    });
  }

  return listings;
}

/**
 * SHEIN: catálogo em markdown (Jina sobre o site português, que não exige
 * CAPTCHA). Cada cartão traz a imagem com o título no texto alternativo, o preço
 * em euros e o link terminado em `-p-<id>.html`.
 */
export function parseSheinMarkdown(markdown: string): Listing[] {
  const listings: Listing[] = [];
  const seen = new Set<string>();

  const imageRe = /!\[Image \d+: ([^\]]{15,400})\]\((https:\/\/img[^)\s]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = imageRe.exec(markdown)) !== null) {
    const span = markdown.slice(match.index, match.index + 3000);
    const idMatch = span.match(
      /(https:\/\/pt\.shein\.com\/[^\s)"']+-p-(\d+)\.html)/
    );
    if (!idMatch) continue;

    const externalId = idMatch[2];
    if (seen.has(externalId)) continue;

    const price = toPrice(span.match(/(\d+(?:[.,]\d{1,2})?)\s*€/)?.[1]);
    const title = cleanTitle(match[1]);

    if (!title || title.length < 10 || price <= 0) continue;

    seen.add(externalId);
    listings.push({
      title,
      price,
      currency: "EUR",
      image: match[2],
      url: idMatch[1],
      externalId,
    });
  }

  return listings;
}

/** SHEIN: o catálogo vem embutido em JSON no HTML. */
export function parseShein(html: string): Listing[] {
  const listings: Listing[] = [];
  const seen = new Set<string>();

  const itemRe = /"goods_id":\s*"?(\d{6,})"?[\s\S]{0,2500}?"goods_name":\s*"([^"]{6,300})"/g;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(html)) !== null) {
    const externalId = match[1];
    if (seen.has(externalId)) continue;

    const near = html.slice(match.index, match.index + 3500);
    const price = toPrice(
      near.match(/"(?:salePrice|sale_price|price)":\s*\{?\s*"?amount"?\s*:?\s*"?([\d.,]+)/)?.[1] ??
        near.match(/\$\s?(\d+(?:[.,]\d{1,2})?)/)?.[1]
    );
    const image =
      near.match(/https:\/\/img\.ltwebstatic\.com[^"'\s\\]+\.(?:jpg|jpeg|png|webp)[^"'\s\\]*/)?.[0] ??
      null;

    if (price <= 0) continue;
    seen.add(externalId);
    listings.push({
      title: cleanTitle(match[2].replace(/\\u002F/g, "/")),
      price,
      currency: "USD",
      image,
      url: `https://www.shein.com/pdsearch/${encodeURIComponent(externalId)}.html`,
      externalId,
    });
  }

  return listings;
}
