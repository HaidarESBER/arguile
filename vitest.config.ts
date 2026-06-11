import { defineConfig, Plugin } from "vitest/config";
import path from "path";
import { readFileSync } from "fs";

/**
 * Strip "use server" and "use client" directives so Vitest
 * treats all exports as normal functions (no RSC transform).
 */
function stripDirectives(): Plugin {
  return {
    name: "strip-use-directives",
    enforce: "pre",
    load(id) {
      if (!id.includes("node_modules") && /\.(ts|tsx|js|jsx)$/.test(id)) {
        try {
          const code = readFileSync(id, "utf-8");
          if (/^\s*["']use (server|client)["'];?/m.test(code)) {
            const stripped = code
              .replace(/^\s*["']use server["'];?\s*/m, "")
              .replace(/^\s*["']use client["'];?\s*/m, "");
            return { code: stripped, map: null };
          }
        } catch {
          // file doesn't exist or can't be read
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [stripDirectives()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./__tests__/stubs/server-only.ts"),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
  },
});
