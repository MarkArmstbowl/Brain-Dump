import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});

if (!globalThis.crypto?.randomUUID) {
  let nextId = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => `test-thought-${++nextId}` }
  });
}
