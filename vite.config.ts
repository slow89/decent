import path from "node:path";
import { fileURLToPath } from "node:url";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
  build: {
    cssMinify: false,
    cssTarget: "chrome64",
    target: "chrome64",
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
