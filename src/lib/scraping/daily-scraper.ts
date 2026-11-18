import { and, desc, eq } from "drizzle-orm";
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

const IPHONE_REJECT = /pe[cç]as|bloquead|partid|quebrad|para arranjo|avariad/i;

const TASKS: ScraperTask[] = [
  {
    platform: "VINTED",
    term: "iphone 13",
    categoryName: "iPhones Seminovos",
    categorySlug: "iphones-seminovos",
    accept: (l) => /iphone/i.test(l.title) && !IPHONE_REJECT.test(l.title),
  },
  {
    platform: "VINTED",
    term: "iphone 14 pro",
    categoryName: "iPhones Seminovos",
    categorySlug: "iphones-seminovos",
    accept: (l) => /iphone/i.test(l.title) && !IPHONE_REJECT.test(l.title),
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

async function collectShein(term: string): Promise<Listing[]> {
  const markdown = await fetchMarkdown(
    `https://pt.shein.com/pdsearch/${encodeURIComponent(term)}/`
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

async function saveListing(
  listing: Listing,
  task: ScraperTask
): Promise<"created" | "updated" | "skipped"> {
  const categoryId = await ensureCategory(task.categoryName, task.categorySlug);

  const existing = await db
    .select({ id: products.id, price: products.originalPrice })
    .from(products)
    .where(
      and(eq(products.source, task.platform), eq(products.externalProductId, listing.externalId))
    )
    .limit(1);

  if (existing.length > 0) {
    const current = Number(existing[0].price ?? 0);
    if (Math.abs(current - listing.price) < 0.01) return "skipped";

    await db
      .update(products)
      .set({
        originalPrice: listing.price.toFixed(2),
        defaultImage: listing.image ?? undefined,
        lastPriceCheckAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(products.id, existing[0].id));
    return "updated";
  }

  const slug = buildSlug(task.platform, listing.title, listing.externalId);

  await db.insert(products).values({
    externalProductId: listing.externalId,
    sourceUrl: listing.url,
    source: task.platform,
    name: listing.title,
    slug,
    description: `Produto real importado de ${task.platform === "VINTED" ? "Vinted" : task.platform === "SHEIN" ? "SHEIN" : "AliExpress"}: ${listing.title}`,
    categoryId,
    originalPrice: listing.price.toFixed(2),
    currency: listing.currency,
    availability: "IN_STOCK",
    status: "ACTIVE",
    defaultImage: listing.image,
    weightGrams: estimateWeight(task.platform),
    sku: `IMP-${task.platform}-${listing.externalId}`.substring(0, 100),
    lastPriceCheckAt: new Date(),
  });

  return "created";
}

async function collect(task: ScraperTask): Promise<Listing[]> {
  if (task.platform === "VINTED") {
    const markdown = await fetchMarkdown(
      `https://www.vinted.pt/catalog?search_text=${encodeURIComponent(task.term)}&order=newest_first`
    );
    return markdown ? parseVinted(markdown) : [];
  }

  if (task.platform === "ALIEXPRESS") {
    const markdown = await fetchMarkdown(
      `https://pt.aliexpress.com/w/wholesale-${encodeURIComponent(task.term)}.html`
    );
    return markdown ? parseAliExpress(markdown) : [];
  }

  return collectShein(task.term);
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

      let created = 0;
      let updated = 0;
      // Limite por tarefa e verificação de orçamento dentro do ciclo: cada
      // gravação na base de dados demora, pelo que uma tarefa sozinha pode
      // consumir o tempo todo.
      const batch = accepted.slice(0, 10);
      let processed = 0;
      for (const listing of batch) {
        if (Date.now() - startedAt > budgetMs) break;
        try {
          const outcome = await saveListing(listing, task);
          if (outcome === "created") created++;
          if (outcome === "updated") updated++;
        } catch (error: any) {
          counters.errors++;
          console.error(`[Scraper] Erro a guardar "${listing.title}": ${error?.message ?? error}`);
        }
        processed++;
      }

      counters.created += created;
      counters.updated += updated;
      counters.tasks++;
      // Se a tarefa ficou a meio, o cursor não avança para que a execução
      // seguinte a retome em vez de deixar anúncios por recolher.
      cursor = processed < batch.length ? index : (index + 1) % TASKS.length;

      details.push({
        task: `${task.platform}:${task.term}`,
        accepted: accepted.length,
        created,
        updated,
      });
      console.log(
        `[Scraper] ${task.platform} "${task.term}": ${accepted.length} aceites, ${created} novos, ${updated} atualizados`
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
