import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const databaseUrl = process.env.DATABASE_URL;

// For development, use SQLite if no DATABASE_URL is provided
const isDevelopment = process.env.NODE_ENV !== "production";
const useSqlite = isDevelopment && (!databaseUrl || databaseUrl.startsWith("file:"));

// During build time, we need a mock database to avoid connection issues
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_PHASE === "phase-development-build";

let db: ReturnType<typeof drizzle> | ReturnType<typeof import("drizzle-orm/node-postgres").drizzle>;

if (isBuildTime) {
  // Create a mock database for build time
  const mockDb = new Database(":memory:");
  // Create minimal tables for build
  mockDb.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, phone TEXT, password_hash TEXT, role TEXT DEFAULT 'customer', created_at TEXT, updated_at TEXT);
    CREATE TABLE customer_profiles (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT, whatsapp TEXT, created_at TEXT);
    CREATE TABLE products (id INTEGER PRIMARY KEY, external_product_id TEXT, source_url TEXT, source TEXT, name TEXT, slug TEXT, description TEXT, category_id INTEGER, original_price REAL, currency TEXT, availability TEXT, status TEXT, sku TEXT, default_image TEXT, weight_grams INTEGER, rating REAL, review_count INTEGER DEFAULT 0, last_price_check_at TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, slug TEXT, description TEXT, icon TEXT, created_at TEXT);
    CREATE TABLE orders (id INTEGER PRIMARY KEY, reference TEXT, customer_id INTEGER, customer_name TEXT, customer_email TEXT, customer_phone TEXT, customer_whatsapp TEXT, status TEXT, payment_status TEXT, payment_method TEXT, subtotal_cents INTEGER, service_fee_cents INTEGER, logistics_fee_cents INTEGER, delivery_fee_cents INTEGER, total_cents INTEGER, currency TEXT, exchange_rate_used REAL, margin_status TEXT, estimated_cost_cents INTEGER, actual_cost_cents INTEGER, notes TEXT, internal_notes TEXT, payment_proof_url TEXT, payment_expires_at TEXT, paid_at TEXT, created_at TEXT, updated_at TEXT);
  `);
  db = drizzle(mockDb, { schema });
  console.log("[DB] Using mock in-memory database for build");
} else if (useSqlite) {
  // SQLite for local development - use absolute path to project root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, "..", ".."); // src/db -> project root
  const dbPath = join(projectRoot, "local.db");

  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
  console.log("[DB] Using SQLite for development at:", dbPath);
} else if (databaseUrl) {
  // PostgreSQL for production (Neon)
  const { Pool } = await import("pg");
  const { drizzle: drizzlePg } = await import("drizzle-orm/node-postgres");

  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: import("pg").Pool;
  };

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = drizzlePg(pool, { schema });
  console.log("[DB] Using PostgreSQL (Neon)");
} else {
  throw new Error("DATABASE_URL is required for production");
}

// Helper for scripts that import this module outside Next.js (e.g. tsx)
export async function getDb() {
  return db;
}

export { db };
