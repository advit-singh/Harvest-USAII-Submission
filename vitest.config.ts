import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/services/**/*.ts"],
      exclude: [
        "src/services/**/*-mappers.ts",
        "src/services/**/*-types.ts",
        "src/services/**/index.ts",
      ],
      thresholds: {
        lines: 40,
        functions: 40,
        statements: 40,
        branches: 35,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
