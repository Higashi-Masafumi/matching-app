import BetterSqlite3, {
  type Database as BetterSqlite3Instance,
} from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema";

export type DatabaseClient = {
  connection: BetterSqlite3Instance;
  db: BetterSQLite3Database<typeof schema>;
};

export const createDatabaseClient = (): DatabaseClient => {
  const databasePath =
    process.env.DATABASE_PATH ?? join(process.cwd(), "data", "dev.db");
  mkdirSync(dirname(databasePath), { recursive: true });

  const connection = new BetterSqlite3(databasePath);
  const db = drizzle(connection, { schema });

  return { connection, db };
};
