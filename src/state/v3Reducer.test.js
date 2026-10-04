import { expect, it } from "vitest";
import { thoughtActions as actions, thoughtReducer as reduce } from "./thoughtReducer";
import { loadThoughts } from "../storage/thoughtStorage";

it("migrates legacy priority flags and retains IDs, order and unknown creation times", () => {
  localStorage.setItem("brain-dump-thoughts", JSON.stringify([
    { id: "old", text: "Legacy", category: "do", isPriority: true },
    { id: "other", text: "Other", category: "decide" }
  ]));
  const { thoughts, error } = loadThoughts();
  expect(error).toBe("");
  expect(thoughts.map(({ id }) => id)).toEqual(["old", "other"]);
  expect(thoughts[0]).toMatchObject({ priority: "medium", isPriority: true });
  expect(thoughts[0].createdAt).toBeUndefined();
});
it("sorts Do slots by level stably and clears priority on category change", () => {
  const initial = [
    { id: "a", text: "A", category: "do", priority: "low" },
    { id: "b", text: "B", category: "decide" },
    { id: "c", text: "C", category: "do", priority: "high" },
    { id: "d", text: "D", category: "do", priority: "high" }
  ];
  const sorted = reduce(initial, actions.sortPriority());
  expect(sorted.map(({ id }) => id)).toEqual(["c", "b", "d", "a"]);
  const changed = reduce(sorted, actions.move("c", "decide"));
  expect(changed.find(({ id }) => id === "c")).toMatchObject({ priority: "none", isPriority: false });
  expect(reduce(initial, actions.setPriority("b", "high"))).toBe(initial);
});

it("records and resolves a decision, reopens it, and retains its recorded outcome", () => {
  const initial = [{ id: "d", text: "Choose a course", category: "decide" }];
  expect(reduce(initial, actions.resolve("d"))).toBe(initial);
  const recorded = reduce(initial, actions.recordDecision("d", " Take art "));
  const resolved = reduce(recorded, actions.resolve("d"));
  expect(resolved[0]).toMatchObject({ status: "resolved", decision: "Take art", isNext: false });
  const reopened = reduce(resolved, actions.restore("d"));
  expect(reopened[0]).toMatchObject({ status: "active", decision: "Take art" });
  expect(reopened[0].events.map(({ type }) => type)).toEqual(["resolved", "active"]);
});
it("dismisses and restores Let Go thoughts and archives completed thoughts without losing text", () => {
  const initial = [{ id: "l", text: "Let it go", category: "let-go" },
    { id: "t", text: "Do it", category: "do", isNext: true, isPriority: true }];
  const dismissed = reduce(initial, actions.dismiss("l"));
  expect(dismissed[0].status).toBe("dismissed");
  expect(reduce(dismissed, actions.selectNext("l"))).toBe(dismissed);
  const completed = reduce(dismissed, actions.complete("t"));
  const archived = reduce(completed, actions.archive("t"));
  expect(archived[1]).toMatchObject({ status: "archived", text: "Do it", priority: "none", isNext: false });
  expect(reduce(archived, actions.unarchive("t"))[1].status).toBe("completed");
  expect(reduce(archived, actions.clearActive())).toHaveLength(2);
});

it("saves/returns a thought, counts repeated deferrals, and validates revisit dates", () => {
  const initial = [{ id: "t", text: "Later", category: "do", isPriority: true, isNext: true }];
  expect(reduce(initial, actions.saveLater("t", "2026-02-31"))).toBe(initial);
  const saved = reduce(initial, actions.saveLater("t", "2026-10-05"));
  expect(saved[0]).toMatchObject({ status: "saved", deferredCount: 1, revisitDate: "2026-10-05", isNext: false, priority: "none" });
  const acknowledged = reduce(saved, actions.acknowledgeReminder("t"));
  expect(acknowledged[0].reminderAcknowledgedDate).toBe("2026-10-05");
  const rescheduled = reduce(acknowledged, actions.setRevisitDate("t", "2026-10-06"));
  expect(rescheduled[0].reminderAcknowledgedDate).toBeUndefined();
  const active = reduce(rescheduled, actions.restore("t"));
  expect(active[0]).toMatchObject({ status: "active", deferredCount: 1 });
  expect(active[0].revisitDate).toBeUndefined();
  expect(reduce(active, actions.saveLater("t"))[0].deferredCount).toBe(2);
});
