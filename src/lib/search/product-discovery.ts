import type { NormalizedProduct, ProductSource } from "@/lib/types";

export type DiscoveryStore = "ALL" | "SHEIN" | "ALIEXPRESS" | "VINTED";

export type DiscoverableProduct = NormalizedProduct & {
  publishedAt?: Date | string | null;
};

interface DiscoveryFilters {
  store: DiscoveryStore;
  query: string;
}

interface DiscoveryResult {
  products: DiscoverableProduct[];
  vintedFreshnessUnavailable: boolean;
}

const APPAREL_TERMS =
  /vestu[aá]rio|roupa|moda|vestido|camisa|blusa|cal[cç]a|jeans|saia|casaco|jaqueta|blazer|conjunto|lingerie|cueca|suti[aã]|top\b|shorts|meia|moletom|pul[oô]ver|dress|shirt|blouse|pants|clothing|apparel|skirt|jacket|coat|underwear|sweater|hoodie|cardigan|jumpsuit|romper|pajamas?|swimwear|leggings|socks?/i;

const FOOTWEAR_TERMS =
  /\b(sapato|t[eê]nis|sand[aá]lia|chinelo|chinelos|bota|botas|cal[cç]ado|shoe|shoes|sneaker|sneakers|slipper|flip[- ]flop)\b/i;

const NON_APPAREL_TERMS =
  /maquiagem|make[- ]?up|cosm[eé]tico|pinc[eé]is|len[cç][oó]is|fronha|almofada|toalha de mesa|decora[cç][aã]o|candeeiro|l[aâ]mpada|bolsa|carteira|mochila|brinco|colar|pulseira|rel[oó]gio|bon[eé]|chap[eé]u|[oó]culos|sunglasses|bedding|bedsheet|pillow|curtain|rug|lamp|backpack|jewell?ery|beauty|handbag/i;

const ELECTRONIC_TERMS =
  /eletr[oô]nic|gadget|acess[oó]rio eletr[oô]nico|smartphone|telefone|tablet|auricular|fone|headphone|earphone|bluetooth|smartwatch|rel[oó]gio inteligente|carregador|charger|cabo usb|power bank|bateria externa|adaptador|usb|teclado|keyboard|rato sem fios|wireless mouse|c[aâ]mara|camera|ring light|l[aâ]mpada inteligente|memory card|cart[aã]o de mem[oó]ria|ssd|pendrive/i;

const IPHONE_ACCESSORY_TERMS =
  /\b(capa|capinha|case|funda|pel[ií]cula|protetor de ecr[aã]|screen protector|carregador|charger|cabo|cable|bateria|battery|pe[cç]a|part|display|ecr[aã]|screen|acess[oó]rio|accessory|suporte|stand|replacement|repair|para arranjo)\b/i;

function getProductStore(product: DiscoverableProduct): Exclude<DiscoveryStore, "ALL"> | null {
  const source = product.source as ProductSource;
  if (source === "SHEIN" || source === "MOCK") return "SHEIN";
  if (source === "ALIEXPRESS" || source === "VINTED") return source;

  try {
    const hostname = new URL(product.sourceUrl || "").hostname.toLowerCase();
    if (hostname.includes("shein") || hostname.includes("romwe")) return "SHEIN";
    if (hostname.includes("aliexpress")) return "ALIEXPRESS";
    if (hostname.includes("vinted")) return "VINTED";
  } catch {
    return null;
  }

  return null;
}

function searchableText(product: DiscoverableProduct): string {
  return [product.name, product.category?.name, product.category?.slug, product.description]
    .filter(Boolean)
    .join(" ");
}

function isApparel(product: DiscoverableProduct): boolean {
  return (
    APPAREL_TERMS.test(searchableText(product)) &&
    !FOOTWEAR_TERMS.test(product.name) &&
    !NON_APPAREL_TERMS.test(product.name)
  );
}

function isElectronic(product: DiscoverableProduct): boolean {
  return ELECTRONIC_TERMS.test(searchableText(product));
}

function isIphone(product: DiscoverableProduct): boolean {
  return /\biphone\b/i.test(product.name) && !IPHONE_ACCESSORY_TERMS.test(product.name);
}

function isPublishedWithin72Hours(product: DiscoverableProduct, now: Date): boolean {
  if (!product.publishedAt) return false;
  const publishedAt = new Date(product.publishedAt);
  if (!Number.isFinite(publishedAt.getTime())) return false;

  const ageMs = now.getTime() - publishedAt.getTime();
  return ageMs >= 0 && ageMs <= 72 * 60 * 60 * 1000;
}

export function discoverProducts(
  products: DiscoverableProduct[],
  filters: DiscoveryFilters,
  now = new Date()
): DiscoveryResult {
  const query = filters.query.trim().toLocaleLowerCase("pt-PT");
  const matchingProducts = products.filter((product) => {
    const store = getProductStore(product);
    if (!store || (filters.store !== "ALL" && store !== filters.store)) return false;

    if (store === "SHEIN" && !isApparel(product)) return false;
    if (store === "ALIEXPRESS" && !isElectronic(product)) return false;

    const text = searchableText(product).toLocaleLowerCase("pt-PT");
    if (query && !text.includes(query)) return false;

    if (store === "VINTED" && (!isIphone(product) || !isPublishedWithin72Hours(product, now))) {
      return false;
    }

    return true;
  });

  const vintedCandidates = products.filter((product) => {
    const store = getProductStore(product);
    if (store !== "VINTED" || !isIphone(product)) return false;
    const text = searchableText(product).toLocaleLowerCase("pt-PT");
    return !query || text.includes(query);
  });

  return {
    products: matchingProducts,
    vintedFreshnessUnavailable:
      filters.store === "VINTED" && vintedCandidates.length > 0 && matchingProducts.length === 0,
  };
}
