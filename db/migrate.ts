import { db } from "./index";
import { migrate } from "drizzle-orm/neon-http/migrator";

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "/home/usiel667/DEV/Next js/full_stack_01/repairshop/db/migrations",
    });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Error applying migrations:", error);
    process.exit(1);
  }
};

main();
