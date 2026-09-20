import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createCategorySuggestionHandler } from "./server/categorySuggestion.js";
import {
  createFirstStepSuggestionHandler,
  createListSuggestionHandler
} from "./server/focusSuggestion.js";
import { createFixedWindowRateLimiter } from "./server/rateLimiter.js";

function aiSuggestionApi(env) {
  const rateLimiter = createFixedWindowRateLimiter();
  const categoryHandler = createCategorySuggestionHandler({
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    rateLimiter
  });
  const priorityHandler = createListSuggestionHandler({
    kind: "priority",
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    rateLimiter
  });
  const nextHandler = createListSuggestionHandler({
    kind: "next",
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    rateLimiter
  });
  const firstStepHandler = createFirstStepSuggestionHandler({
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    rateLimiter
  });

  function register(server) {
    server.middlewares.use("/api/category-suggestion", categoryHandler);
    server.middlewares.use("/api/priority-suggestion", priorityHandler);
    server.middlewares.use("/api/next-suggestion", nextHandler);
    server.middlewares.use("/api/first-step-suggestion", firstStepHandler);
  }

  return {
    name: "ai-suggestion-api",
    configureServer: register,
    configurePreviewServer: register
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), aiSuggestionApi(env)],
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      css: true
    }
  };
});
