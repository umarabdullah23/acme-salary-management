import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    passWithNoTests: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/server/**/*.ts"],
      exclude: ["src/server/**/*.d.ts"],
      reporter: ["text-summary", "text"],
      thresholds: { lines: 85 },
    },
  },
});
