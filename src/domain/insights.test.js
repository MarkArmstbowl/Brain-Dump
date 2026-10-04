import { expect, it } from "vitest";
import { buildInsights, completionEvents, sessionSummary } from "./insights";
const workspace = { currentId: "second", dumps: [
  { id: "first", title: "First", startedAt: "2026-10-01T10:00:00Z", thoughts: [
    { id: "a", text: "Prepare project presentation", category: "do", status: "archived", archivedFrom: "completed", completedAt: "2026-10-01T11:00:00Z",
      events: [{ type: "completed", from: "active", at: "2026-10-01T11:00:00Z" }, { type: "completed", from: "archived", at: "2026-10-01T12:00:00Z" }] },
    { id: "b", text: "Choose project scope", category: "decide", status: "resolved", decision: "Small", deferredCount: 2 }
  ] },
  { id: "second", title: "Second", startedAt: "2026-10-02T10:00:00Z", thoughts: [
    { id: "c", text: "Review project progress", category: "do", status: "active", isNext: true },
    { id: "d", text: "Plan a trip", category: "do", status: "saved", deferredCount: 1 }
  ] }
] };
it("finds cross-dump topic clues, excludes common words and ranks repeated deferrals", () => {
  const insights = buildInsights(workspace);
  expect(insights.recurring).toEqual([{ word: "project", dumps: 2, thoughts: 3 }]);
  expect(insights.deferred.map(({ id }) => id)).toEqual(["b"]);
  expect(insights.review.map(({ id }) => id)).toEqual(["a", "b"]);
});
it("reports category distributions and completion events without counting unarchive as completion", () => {
  const { trends } = buildInsights(workspace);
  expect(trends[0].categories).toEqual({ unsorted: 0, do: 1, decide: 1, "let-go": 0 });
  expect(trends[0].completions).toBe(1);
  expect(sessionSummary(workspace.dumps[1])).toContain("2 thoughts in this dump: 1 active");
  expect(sessionSummary(workspace.dumps[1])).toContain("Next: Review project progress");
});
it("does not recount older completion events when a deferred thought returns to a newer dump", () => {
  expect(completionEvents({ originDumpId: "first", events: [
    { type: "completed", from: "active", at: "2026-10-01T12:00:00Z" },
    { type: "completed", from: "active", at: "2026-10-03T12:00:00Z" }
  ] }, "2026-10-02T00:00:00Z")).toBe(1);
});
