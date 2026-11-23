import { describe, expect, it } from "vitest";
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
