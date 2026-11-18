-- Adiciona customs_fee_cents à tabela orders
-- Aplicar: psql "$DATABASE_URL" -f drizzle/pg/0001_add_customs_fee_to_orders.sql

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customs_fee_cents" integer NOT NULL DEFAULT 0;