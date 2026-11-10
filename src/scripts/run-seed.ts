import "dotenv/config";
import { seedDatabase } from "@/lib/seed";

async function main() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main();
