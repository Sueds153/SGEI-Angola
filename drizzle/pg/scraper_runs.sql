-- Histórico de execuções do scraper automático.
-- Aplicar em bases já existentes: psql "$DATABASE_URL" -f drizzle/pg/scraper_runs.sql

CREATE TABLE IF NOT EXISTS "scraper_runs" (
  "id" serial PRIMARY KEY,
  "trigger" varchar(30) NOT NULL DEFAULT 'cron',
  "status" varchar(20) NOT NULL DEFAULT 'RUNNING',
  "tasks_processed" integer NOT NULL DEFAULT 0,
  "products_created" integer NOT NULL DEFAULT 0,
  "products_updated" integer NOT NULL DEFAULT 0,
  "errors" integer NOT NULL DEFAULT 0,
  "next_cursor" integer NOT NULL DEFAULT 0,
  "duration_ms" integer,
  "message" text,
  "started_at" timestamp NOT NULL DEFAULT now(),
  "finished_at" timestamp
);

CREATE INDEX IF NOT EXISTS "scraper_runs_started_at_idx" ON "scraper_runs" ("started_at");
