import type { NextConfig } from "next";

const dbFiles = ["./data/acme.db"];

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/api/**/*": dbFiles,
    "/employees": dbFiles,
    "/insights": dbFiles,
    "/": dbFiles,
  },
};

export default nextConfig;
