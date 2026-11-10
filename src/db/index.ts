import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const databaseUrl = process.env.DATABASE_URL;

// For development, use SQLite if no DATABASE_URL is provided
const isDevelopment = process.env.NODE_ENV !== "production";
const useSqlite = isDevelopment && (!databaseUrl || databaseUrl.startsWith("file:"));

let db: ReturnType<typeof drizzle>;

if (useSqlite) {
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

export { db };