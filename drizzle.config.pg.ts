import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Configuração Drizzle para PostgreSQL/Neon.
 * A credencial vem de DATABASE_URL — nunca deve ser escrita no repositório.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle/pg",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
