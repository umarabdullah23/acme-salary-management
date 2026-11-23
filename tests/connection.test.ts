import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { openDatabase, resolveDbLocation } from "@/server/db/connection";

describe("database location", () => {
  it("uses the bundled file locally", () => {
    expect(resolveDbLocation({}, "/app")).toEqual({ file: "/app/data/acme.db" });
  });

  it("copies to /tmp on Vercel", () => {
    expect(resolveDbLocation({ VERCEL: "1" }, "/var/task")).toEqual({
      file: "/tmp/acme.db",
      copyFrom: "/var/task/data/acme.db",
    });
  });
});

describe("openDatabase", () => {
  it("creates the schema and seeds FX rates", () => {
    const db = openDatabase(":memory:");
    const rows = db.prepare("SELECT COUNT(*) AS n FROM fx_rates").get() as { n: number };
    expect(rows.n).toBe(8);
  });
});

describe("getDb", () => {
  it("opens data/acme.db under the working directory and caches the handle", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acme-test-"));
    fs.mkdirSync(path.join(dir, "data"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);
    vi.resetModules();
    try {
      const { getDb } = await import("@/server/db/connection");
      const db = getDb();
      expect(db.name).toBe(path.join(dir, "data", "acme.db"));
      expect(getDb()).toBe(db);
      db.close();
    } finally {
      vi.restoreAllMocks();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
