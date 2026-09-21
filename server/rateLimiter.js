export const AI_RATE_LIMIT = Object.freeze({
  requests: 12,
  windowMs: 60_000
});

export function createFixedWindowRateLimiter({
  requests = AI_RATE_LIMIT.requests,
  windowMs = AI_RATE_LIMIT.windowMs,
  now = Date.now
} = {}) {
  const clients = new Map();

  return {
    consume(clientId) {
      const currentTime = now();
      const current = clients.get(clientId);
      const windowExpired = !current || currentTime - current.startedAt >= windowMs;
      const entry = windowExpired
        ? { count: 0, startedAt: currentTime }
        : current;

      if (entry.count >= requests) {
        return {
          allowed: false,
          limit: requests,
          remaining: 0,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((windowMs - (currentTime - entry.startedAt)) / 1_000)
          )
        };
      }

      entry.count += 1;
      clients.set(clientId, entry);

      return {
        allowed: true,
        limit: requests,
        remaining: requests - entry.count,
        retryAfterSeconds: 0
      };
    }
  };
}

export function getClientId(request) {
  return request.socket?.remoteAddress || "unknown-client";
}
