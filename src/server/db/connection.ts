import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { FX_AS_OF, FX_RATES_TO_USD } from "../domain/fx";
import { SCHEMA_SQL } from "./schema";

export type Db = Database.Database;

/** Opens a database, applies pragmas, schema and reference FX rates. Use ":memory:" in tests. */
export function openDatabase(file: string): Db {
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

export function migrate(db: Db): void {
  db.exec(SCHEMA_SQL);
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO fx_rates (currency, rate_to_usd, as_of) VALUES (?, ?, ?)",
  );
  db.transaction(() => {
    for (const [currency, rate] of Object.entries(FX_RATES_TO_USD)) upsert.run(currency, rate, FX_AS_OF);
  })();
}

export interface DbLocation {
  file: string;
  /** Bundled read-only file to copy from before opening, when running on a serverless host. */
  copyFrom?: string;
}

export function resolveDbLocation(env: Readonly<Record<string, string | undefined>>, cwd: string): DbLocation {
  const bundled = path.join(cwd, "data", "acme.db");
  if (env.VERCEL) return { file: "/tmp/acme.db", copyFrom: bundled };
  return { file: bundled };
}

let cached: Db | undefined;

/** Process-wide handle used by route handlers and server components. */
export function getDb(): Db {
  if (cached) return cached;
  const location = resolveDbLocation(process.env, process.cwd());
  if (location.copyFrom && !fs.existsSync(location.file)) {
    fs.copyFileSync(location.copyFrom, location.file);
  }
  fs.mkdirSync(path.dirname(location.file), { recursive: true });
  cached = openDatabase(location.file);
  return cached;
}
