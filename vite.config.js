import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createCategorySuggestionHandler } from "./server/categorySuggestion.js";

function categorySuggestionApi(env) {
  const handler = createCategorySuggestionHandler({
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL
  });

  return {
    name: "category-suggestion-api",
    configureServer(server) {
      server.middlewares.use("/api/category-suggestion", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/category-suggestion", handler);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), categorySuggestionApi(env)],
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      css: true
    }
  };
});
