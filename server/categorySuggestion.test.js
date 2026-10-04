import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { afterEach, expect, it, vi } from "vitest";
import { createCategorySuggestionHandler } from "./categorySuggestion";

function request(body) {
  const result = Readable.from([Buffer.from(JSON.stringify(body))]);
  result.method = "POST";
  result.socket = { remoteAddress: "test" };
  return result;
}
class Response extends EventEmitter {
  headers = {};
  writableEnded = false;
  setHeader(key, value) { this.headers[key] = value; }
  end(body) { this.body = JSON.parse(body); this.writableEnded = true; }
}
afterEach(() => vi.unstubAllGlobals());
function provider(value) {
  return vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({
    choices: [{ message: { content: JSON.stringify(value) } }]
  }) }));
}
it("returns a validated category with its explanation", async () => {
  provider({ category: "do", reason: "A concrete action." });
  const response = new Response();
  await createCategorySuggestionHandler({ apiKey: "test" })(request({ thought: "Send email" }), response);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ category: "do", reason: "A concrete action." });
});
it("maps every batch item back to the local ID without sending IDs to Groq", async () => {
  provider({ suggestions: [{ itemNumber: 2, category: "decide", reason: "A choice." },
    { itemNumber: 1, category: "do", reason: "An action." }] });
  const response = new Response();
  await createCategorySuggestionHandler({ apiKey: "test", batch: true })(request({ thoughts: [
    { id: "local-a", text: "Send email" }, { id: "local-b", text: "Choose course" }
  ] }), response);
  expect(response.statusCode).toBe(200);
  expect(response.body.suggestions.map(({ id }) => id)).toEqual(["local-b", "local-a"]);
  expect(JSON.parse(fetch.mock.calls[0][1].body).messages[1].content).not.toContain("local-a");
});
it.each([
  { suggestions: [{ itemNumber: 1, category: "do", reason: "Action" }] },
  { suggestions: [{ itemNumber: 1, category: "do", reason: "Action" }, { itemNumber: 1, category: "do", reason: "Action" }] },
  { suggestions: [{ itemNumber: 1, category: "bad", reason: "Action" }, { itemNumber: 2, category: "do", reason: "Action" }] }
])("rejects incomplete, duplicate or invalid batch results", async (value) => {
  provider(value);
  const response = new Response();
  await createCategorySuggestionHandler({ apiKey: "test", batch: true })(request({ thoughts: [
    { id: "a", text: "A" }, { id: "b", text: "B" }
  ] }), response);
  expect(response.statusCode).toBe(502);
});
it("fails safely when AI is not configured", async () => {
  const response = new Response();
  await createCategorySuggestionHandler({})(request({ thought: "A" }), response);
  expect(response.statusCode).toBe(503);
});
