import { createFixedWindowRateLimiter, getClientId } from "./rateLimiter.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const MAX_REQUEST_BYTES = 4_096;
const MAX_THOUGHT_LENGTH = 1_000;

const SYSTEM_PROMPT = `You categorize one short thought for a mental-clutter app.

Choose exactly one category:
- do: a concrete action the user can take or complete.
- decide: a choice, question, uncertainty, or issue that needs a decision.
- let-go: something the user cannot usefully act on now and may release.

Return only the category. Never give advice, add tasks, or rewrite the thought. A suggestion must not change the user's data; the user decides whether to accept or override it.`;

const RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "brain_dump_category_suggestion",
    strict: true,
    schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["do", "decide", "let-go"] }
      },
      required: ["category"],
      additionalProperties: false
    }
  }
};

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_REQUEST_BYTES) {
      throw new Error("REQUEST_TOO_LARGE");
    }
    chunks.push(buffer);
  }

  try {
    const body = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(body || "{}");
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function createCategorySuggestionHandler({
  apiKey,
  model = DEFAULT_MODEL,
  rateLimiter = createFixedWindowRateLimiter()
}) {
  return async function categorySuggestionHandler(request, response) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, { error: "Use POST for category suggestions." });
      return;
    }

    if (!apiKey) {
      sendJson(response, 503, {
        error: "AI suggestions are not configured. Add GROQ_API_KEY to your .env file."
      });
      return;
    }

    const rateLimit = rateLimiter.consume(getClientId(request));
    response.setHeader("RateLimit-Limit", String(rateLimit.limit));
    response.setHeader("RateLimit-Remaining", String(rateLimit.remaining));

    if (!rateLimit.allowed) {
      response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
      sendJson(response, 429, {
        error: `Too many AI requests. Try again in ${rateLimit.retryAfterSeconds} seconds.`
      });
      return;
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      const tooLarge = error.message === "REQUEST_TOO_LARGE";
      sendJson(response, tooLarge ? 413 : 400, {
        error: tooLarge ? "That thought is too long to categorize." : "The request was not valid JSON."
      });
      return;
    }

    const thought = typeof body.thought === "string" ? body.thought.trim() : "";
    if (!thought || thought.length > MAX_THOUGHT_LENGTH) {
      sendJson(response, 400, {
        error: `Thoughts must contain 1 to ${MAX_THOUGHT_LENGTH} characters.`
      });
      return;
    }

    try {
      const groqResponse = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: thought }
          ],
          response_format: RESPONSE_SCHEMA,
          reasoning_effort: "low",
          temperature: 0,
          max_completion_tokens: 200
        })
      });

      if (!groqResponse.ok) {
        const statusCode = groqResponse.status === 429 ? 429 : 502;
        sendJson(response, statusCode, {
          error:
            statusCode === 429
              ? "The AI service is busy. Please wait a moment and try again."
              : "The AI suggestion could not be created. Check the key and model, then try again."
        });
        return;
      }

      const result = await groqResponse.json();
      const content = result.choices?.[0]?.message?.content;
      const suggestion = JSON.parse(content || "{}");
      const validCategory = ["do", "decide", "let-go"].includes(suggestion.category);

      if (!validCategory) {
        throw new Error("INVALID_AI_RESPONSE");
      }

      sendJson(response, 200, { category: suggestion.category });
    } catch {
      sendJson(response, 502, {
        error: "The AI returned an unexpected response. Please try again."
      });
    }
  };
}
