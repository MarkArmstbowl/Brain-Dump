import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFirstStepSuggestionHandler,
  createListSuggestionHandler
} from "./focusSuggestion";
import { createFixedWindowRateLimiter } from "./rateLimiter";

function createRequest(body) {
  const request = Readable.from([Buffer.from(JSON.stringify(body))]);
  request.method = "POST";
  request.socket = { remoteAddress: "127.0.0.1" };
  return request;
}

class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.headers = {};
    this.statusCode = 200;
    this.writableEnded = false;
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  end(body) {
    this.body = JSON.parse(body);
    this.writableEnded = true;
    this.emit("close");
  }
}

describe("focus suggestion handlers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps the model's item number back to a local thought id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ itemNumber: 2 }) } }]
      })
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = createListSuggestionHandler({
      kind: "priority",
      apiKey: "test-key"
    });
    const response = new MockResponse();

    await handler(createRequest({
      thoughts: [
        { id: "local-a", text: "Write the outline", isPriority: false },
        { id: "local-b", text: "Submit the assignment", isPriority: true }
      ]
    }), response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ thoughtId: "local-b" });
    const providerBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const providerThoughts = JSON.parse(providerBody.messages[1].content);
    expect(providerThoughts).toEqual([
      { itemNumber: 1, text: "Write the outline", currentlyMarkedPriority: false },
      { itemNumber: 2, text: "Submit the assignment", currentlyMarkedPriority: true }
    ]);
    expect(providerBody.messages[1].content).not.toContain("local-a");
  });

  it("validates and returns one smaller first step", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ step: "Open a blank slide deck" }) } }]
      })
    }));
    const handler = createFirstStepSuggestionHandler({ apiKey: "test-key" });
    const response = new MockResponse();

    await handler(createRequest({ thought: "Build the whole class presentation" }), response);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ step: "Open a blank slide deck" });
  });

  it("shares rate limits across focus suggestion types", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ itemNumber: 1 }) } }]
      })
    });
    vi.stubGlobal("fetch", fetchMock);
    const rateLimiter = createFixedWindowRateLimiter({ requests: 1, windowMs: 60_000 });
    const priorityHandler = createListSuggestionHandler({
      kind: "priority",
      apiKey: "test-key",
      rateLimiter
    });
    const nextHandler = createListSuggestionHandler({
      kind: "next",
      apiKey: "test-key",
      rateLimiter
    });
    const body = { thoughts: [{ id: "one", text: "One task" }] };
    const firstResponse = new MockResponse();
    const secondResponse = new MockResponse();

    await priorityHandler(createRequest(body), firstResponse);
    await nextHandler(createRequest(body), secondResponse);

    expect(firstResponse.statusCode).toBe(200);
    expect(secondResponse.statusCode).toBe(429);
    expect(secondResponse.headers["Retry-After"]).toBe("60");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
