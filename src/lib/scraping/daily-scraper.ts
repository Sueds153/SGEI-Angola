import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { scraperRuns } from "@/db/schema-scraper";
import {
  cleanTitle,
  parseAliExpress,
  parseShein,
  parseSheinMarkdown,
  parseVinted,
  toPrice,
  type Listing,
  type ScraperPlatform,
} from "./parsers";

/**
 * Scraper automático de produtos reais.
 *
 * Corre dentro de uma função serverless com limite de tempo (60s no plano Hobby),
 * por isso cada invocação processa apenas as tarefas que couberem no orçamento e
 * guarda em `scraper_runs.next_cursor` o ponto onde parou. A execução seguinte
 * (cron seguinte, no mesmo dia ou no dia a seguir) continua a partir daí.
 *
 * As imagens são guardadas como URL remoto: o sistema de ficheiros das funções
 * serverless é efémero, pelo que descarregar imagens para `public/` resultaria
 * sempre em imagens quebradas depois do deploy.
 */

const JINA_PREFIX = "https://r.jina.ai/http://";
const FETCH_TIMEOUT_MS = 22_000;
export const SCRAPER_BUDGET_MS = 32_000;

export type { ScraperPlatform } from "./parsers";

interface ScraperTask {
  platform: ScraperPlatform;
  term: string;
  categoryName: string;
  categorySlug: string;
  /** Filtro de qualidade aplicado ao título do anúncio. */
  accept?: (listing: Listing) => boolean;
}

/**
 * Filtro de qualidade para iPhone na Vinted.
 *
 * A Vinted agrega vendedores de toda a Europa, pelo que o título pode vir em
 * neerlandês, francês ou alemão. Rejeitamos acessórios e telemóveis avariados
 * ou bloqueados, e exigimos um preço compatível com um telemóvel funcional.
 */
const IPHONE_REJECT =
  /pe[cç]as|pecas|bloquead|bloqueado|icloud|partid|quebrad|para arranjo|avariad|as[- ]is|n[aã]o funciona|sem funcionar|defeito|danificad|coque|hoesje|hoesjes|case|cover|capa|capinha|funda|etui|h[uü]lle|carcasa|pel[ií]cula|ecr[aã]|carregador|cabo|charger|cable|bateria|battery|suporte|peluche|teclado|keyboard|clicks|\bfor iphone\b|para iphone/i;

const IPHONE_MIN_PRICE = 60;

function acceptIphone(listing: Listing): boolean {
  return (
    /iphone/i.test(listing.title) &&
    !IPHONE_REJECT.test(listing.title) &&
    listing.price >= IPHONE_MIN_PRICE
  );
}

const TASKS: ScraperTask[] = [
  {
    platform: "VINTED",
    term: "iphone 13",
    categoryName: "iPhones Seminovos",
    categorySlug: "iphones-seminovos",
    accept: acceptIphone,
  },
  {
    platform: "VINTED",
    term: "iphone 14 pro",
    categoryName: "iPhones Seminovos",
    categorySlug: "iphones-seminovos",
    accept: acceptIphone,
  },
  {
    platform: "ALIEXPRESS",
    term: "smartwatch amoled",
    categoryName: "Gadgets",
    categorySlug: "gadgets",
  },
  {
    platform: "ALIEXPRESS",
    term: "fone bluetooth anc",
    categoryName: "Gadgets",
    categorySlug: "gadgets",
  },
  {
    platform: "SHEIN",
    term: "vestido midi",
    categoryName: "Vestuário feminino",
    categorySlug: "vestuario-feminino",
  },
  {
    platform: "SHEIN",
    term: "conjunto blazer feminino",
    categoryName: "Vestuário feminino",
    categorySlug: "vestuario-feminino",
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 120);
}

function buildSlug(platform: ScraperPlatform, title: string, externalId: string) {
  const suffix = externalId.slice(-8) || Date.now().toString(36);
  return `${platform.toLowerCase()}-${slugify(title)}-${suffix}`.substring(0, 200);
}

async function fetchMarkdown(url: string): Promise<string | null> {
  const target = url.replace(/^https?:\/\//, "");
  try {
    const response = await fetch(`${JINA_PREFIX}${target}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImportEasyBot/1.0; +https://importeasy-angola.vercel.app)",
        Accept: "text/plain",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn(`[Scraper] ${response.status} em ${url}`);
      return null;
    }
    return await response.text();
  } catch (error: any) {
    console.warn(`[Scraper] Falha de rede em ${url}: ${error?.message ?? error}`);
    return null;
  }
}

// ───────────────────────────── SHEIN ─────────────────────────────

/**
 * A SHEIN bloqueia o domínio principal com um desafio anti-bot, mas o site
 * português (`pt.shein.com`) responde ao leitor do Jina com preços em euros.
 * Só se esse caminho falhar é que recorremos ao ScrapingBee (pago).
 */
async function fetchSheinHtml(term: string): Promise<string | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return null;

  const target = `https://www.shein.com/pdsearch/${encodeURIComponent(term)}/`;
  const endpoint =
    `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}` +
    `&url=${encodeURIComponent(target)}` +
    `&render_js=true&premium_proxy=true&country_code=pt&block_resources=true`;

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn(`[Scraper] ScrapingBee ${response.status} para SHEIN`);
      return null;
    }
    return await response.text();
  } catch (error: any) {
    console.warn(`[Scraper] ScrapingBee falhou para SHEIN: ${error?.message ?? error}`);
    return null;
  }
}

async function collectShein(term: string, page: number): Promise<Listing[]> {
  const markdown = await fetchMarkdown(
    `https://pt.shein.com/pdsearch/${encodeURIComponent(term)}/?page=${page}`
  );
  if (markdown) {
    const listings = parseSheinMarkdown(markdown);
    if (listings.length > 0) return listings;
  }

  const html = await fetchSheinHtml(term);
  return html ? parseShein(html) : [];
}

// ───────────────────────── Persistência ─────────────────────────

async function ensureCategory(name: string, slug: string): Promise<number> {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (existing.length > 0) return existing[0].id;

  const inserted = await db
    .insert(categories)
    .values({ name, slug })
    .returning({ id: categories.id });
  return inserted[0].id;
}

function estimateWeight(platform: ScraperPlatform): number {
  if (platform === "VINTED") return 350;
  if (platform === "SHEIN") return 300;
  return 400;
}

/**
 * Grava um lote de anúncios com uma única consulta de leitura e uma única
 * inserção. Fazer isto linha a linha multiplicava as idas à base de dados e
 * consumia o orçamento de tempo da função serverless.
 */
async function saveListings(
  listings: Listing[],
  task: ScraperTask
): Promise<{ created: number; updated: number }> {
  if (listings.length === 0) return { created: 0, updated: 0 };

  // A mesma listagem pode aparecer repetida no markdown (imagem + link).
  const uniqueListings = [...new Map(listings.map((l) => [l.externalId, l])).values()];

  const categoryId = await ensureCategory(task.categoryName, task.categorySlug);
  const externalIds = uniqueListings.map((listing) => listing.externalId);

  const existing = await db
    .select({
      id: products.id,
      externalId: products.externalProductId,
      price: products.originalPrice,
    })
    .from(products)
    .where(
      and(
        eq(products.source, task.platform),
        inArray(products.externalProductId, externalIds)
      )
    );

  const existingByExternalId = new Map(
    existing.map((row) => [row.externalId ?? "", row])
  );

  const now = new Date();
  const toCreate: Listing[] = [];
  const toUpdate: Array<{ id: number; price: number; image: string | null }> = [];

  for (const listing of uniqueListings) {
    const current = existingByExternalId.get(listing.externalId);
    if (!current) {
      toCreate.push(listing);
      continue;
    }

    if (Math.abs(Number(current.price ?? 0) - listing.price) < 0.01) continue;
    toUpdate.push({ id: current.id, price: listing.price, image: listing.image });
  }

  let created = 0;
  if (toCreate.length > 0) {
    const inserted = await db
      .insert(products)
      .values(
        toCreate.map((listing) => ({
          externalProductId: listing.externalId,
          sourceUrl: listing.url,
          source: task.platform,
          name: listing.title,
          slug: buildSlug(task.platform, listing.title, listing.externalId),
          description: `Produto real importado de ${task.platform === "VINTED" ? "Vinted" : task.platform === "SHEIN" ? "SHEIN" : "AliExpress"}: ${listing.title}`,
          categoryId,
          originalPrice: listing.price.toFixed(2),
          currency: listing.currency,
          availability: "IN_STOCK",
          status: "ACTIVE" as const,
          defaultImage: listing.image,
          weightGrams: estimateWeight(task.platform),
          sku: `IMP-${task.platform}-${listing.externalId}`.substring(0, 100),
          lastPriceCheckAt: now,
        }))
      )
      // Um slug já existente (por exemplo, o mesmo artigo relistado) não deve
      // fazer falhar o lote inteiro.
      .onConflictDoNothing({ target: products.slug })
      .returning({ id: products.id });
    created = inserted.length;
  }

  for (const item of toUpdate) {
    await db
      .update(products)
      .set({
        originalPrice: item.price.toFixed(2),
        defaultImage: item.image ?? undefined,
        lastPriceCheckAt: now,
        updatedAt: now,
      })
      .where(eq(products.id, item.id));
  }

  return { created, updated: toUpdate.length };
}

/**
 * As pesquisas devolvem sempre os mesmos primeiros anúncios. Rodar a página
 * pelo dia do mês faz o catálogo crescer ao longo da semana em vez de repetir
 * os mesmos produtos todos os dias.
 */
function searchPage(): number {
  return (new Date().getUTCDate() % 3) + 1;
}

async function collect(task: ScraperTask): Promise<Listing[]> {
  const page = searchPage();

  if (task.platform === "VINTED") {
    const markdown = await fetchMarkdown(
      `https://www.vinted.pt/catalog?search_text=${encodeURIComponent(task.term)}&order=newest_first&page=${page}`
    );
    return markdown ? parseVinted(markdown) : [];
  }

  if (task.platform === "ALIEXPRESS") {
    const markdown = await fetchMarkdown(
      `https://pt.aliexpress.com/w/wholesale-${encodeURIComponent(task.term)}.html?page=${page}`
    );
    return markdown ? parseAliExpress(markdown) : [];
  }

  return collectShein(task.term, page);
}

// ───────────────────────────── Execução ─────────────────────────────

export interface ScraperRunResult {
  ok: boolean;
  trigger: string;
  tasksProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  errors: number;
  durationMs: number;
  nextCursor: number;
  details: Array<{ task: string; accepted: number; created: number; updated: number }>;
}

export async function runScraperBatch(options: {
  trigger?: string;
  budgetMs?: number;
} = {}): Promise<ScraperRunResult> {
  const trigger = options.trigger ?? "cron";
  const budgetMs = options.budgetMs ?? SCRAPER_BUDGET_MS;
  const startedAt = Date.now();

  const lastRun = await db
    .select({ nextCursor: scraperRuns.nextCursor })
    .from(scraperRuns)
    .orderBy(desc(scraperRuns.startedAt))
    .limit(1);

  const startIndex = lastRun[0]?.nextCursor ?? 0;

  const counters = { created: 0, updated: 0, errors: 0, tasks: 0 };
  const details: ScraperRunResult["details"] = [];
  let cursor = startIndex;

  for (let offset = 0; offset < TASKS.length; offset++) {
    if (Date.now() - startedAt > budgetMs) break;

    const index = (startIndex + offset) % TASKS.length;
    const task = TASKS[index];

    try {
      const listings = await collect(task);
      const accepted = task.accept ? listings.filter((l) => task.accept!(l)) : listings;

      // Limite por tarefa para proteger o orçamento de tempo.
      const batch = accepted.slice(0, 12);
      const outcome = await saveListings(batch, task);

      counters.created += outcome.created;
      counters.updated += outcome.updated;
      counters.tasks++;
      cursor = (index + 1) % TASKS.length;

      details.push({
        task: `${task.platform}:${task.term}`,
        accepted: accepted.length,
        created: outcome.created,
        updated: outcome.updated,
      });
      console.log(
        `[Scraper] ${task.platform} "${task.term}": ${accepted.length} aceites, ${outcome.created} novos, ${outcome.updated} atualizados`
      );
    } catch (error: any) {
      counters.errors++;
      console.error(`[Scraper] Falha na tarefa ${task.platform} "${task.term}": ${error?.message ?? error}`);
      details.push({ task: `${task.platform}:${task.term}`, accepted: 0, created: 0, updated: 0 });
      cursor = (index + 1) % TASKS.length;
    }
  }

  const durationMs = Date.now() - startedAt;
  const status =
    counters.tasks === 0 ? "FAILED" : counters.errors > 0 ? "PARTIAL" : "SUCCESS";

  await db.insert(scraperRuns).values({
    trigger,
    status,
    tasksProcessed: counters.tasks,
    productsCreated: counters.created,
    productsUpdated: counters.updated,
    errors: counters.errors,
    nextCursor: cursor,
    durationMs,
    message: details
      .map((d) => `${d.task}: ${d.accepted} aceites / ${d.created} novos`)
      .join(" | ")
      .slice(0, 4000),
    finishedAt: new Date(),
  });

  return {
    ok: status !== "FAILED",
    trigger,
    tasksProcessed: counters.tasks,
    productsCreated: counters.created,
    productsUpdated: counters.updated,
    errors: counters.errors,
    durationMs,
    nextCursor: cursor,
    details,
  };
}

export function getScraperTasks() {
  return TASKS.map((task) => ({ platform: task.platform, term: task.term, category: task.categoryName }));
}
