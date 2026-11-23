import fs from "node:fs";
import path from "node:path";
import { openDatabase } from "../src/server/db/connection";
import { seedDatabase } from "../src/server/seed/seedDatabase";

const dataDir = path.join(process.cwd(), "data");
const file = path.join(dataDir, "acme.db");

fs.mkdirSync(dataDir, { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(file + suffix, { force: true });

const started = performance.now();
const db = openDatabase(file);
const inserted = seedDatabase(db);
const count = (db.prepare("SELECT COUNT(*) AS n FROM employees").get() as { n: number }).n;
// Single self-contained file (no -wal sidecar) so it can be bundled and copied.
db.pragma("journal_mode = DELETE");
db.close();

console.log(`Seeded ${inserted} employees (${count} rows) into ${path.relative(process.cwd(), file)} in ${Math.round(performance.now() - started)}ms`);
