import path from "node:path";
import { fileURLToPath } from "node:url";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import {
  configDefaults,
  defineConfig,
} from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const reactCompilerConfig = {
  panicThreshold: "all_errors",
} as unknown as Parameters<typeof reactCompilerPreset>[0];

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset(reactCompilerConfig)],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    exclude: [
      ...configDefaults.exclude,
      "**/.claude/**",
    ],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
