import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Registo de execuções do scraper automático.
 * Cada execução guarda o cursor (índice da próxima tarefa) para que a seguinte
 * continue exatamente onde a anterior parou — necessário porque cada invocação
 * serverless tem um limite de tempo.
 */
export const scraperRuns = pgTable(
  "scraper_runs",
  {
    id: serial("id").primaryKey(),
    trigger: varchar("trigger", { length: 30 }).notNull().default("cron"),
    status: varchar("status", { length: 20 }).notNull().default("RUNNING"),
    tasksProcessed: integer("tasks_processed").notNull().default(0),
    productsCreated: integer("products_created").notNull().default(0),
    productsUpdated: integer("products_updated").notNull().default(0),
    errors: integer("errors").notNull().default(0),
    nextCursor: integer("next_cursor").notNull().default(0),
    durationMs: integer("duration_ms"),
    message: text("message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [index("scraper_runs_started_at_idx").on(table.startedAt)]
);
