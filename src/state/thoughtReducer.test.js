import { describe, expect, it } from "vitest";
import { thoughtActions, thoughtReducer } from "./thoughtReducer";

const startingThoughts = [
  { id: "a", text: "First", category: "do", isPriority: true, isNext: true },
  { id: "b", text: "Second", category: "do", isPriority: false, isNext: false },
  { id: "c", text: "Third", category: "decide", isPriority: false, isNext: false }
];

describe("thoughtReducer", () => {
  it("adds new thoughts with inactive priority and Next state", () => {
    const next = thoughtReducer(
      startingThoughts,
      thoughtActions.addMany([{ id: "d", text: "New", category: "do" }])
    );
    expect(next.at(-1)).toEqual({
      id: "d",
      text: "New",
      category: "do",
      status: "active",
      isPriority: false,
      isNext: false
    });
  });

  it("updates and removes thoughts without mutating the prior state", () => {
    const updated = thoughtReducer(
      startingThoughts,
      thoughtActions.update("b", { text: "Changed" })
    );
    const removed = thoughtReducer(updated, thoughtActions.remove("c"));
    expect(updated[1].text).toBe("Changed");
    expect(startingThoughts[1].text).toBe("Second");
    expect(removed.map(({ id }) => id)).toEqual(["a", "b"]);
  });

  it("reorders within a category and moves between categories", () => {
    const reordered = thoughtReducer(
      startingThoughts,
      thoughtActions.move("b", "do", "a")
    );
    expect(reordered.map(({ id }) => id)).toEqual(["b", "a", "c"]);

    const moved = thoughtReducer(reordered, thoughtActions.move("a", "decide"));
    expect(moved.map(({ id }) => id)).toEqual(["b", "c", "a"]);
    expect(moved.find(({ id }) => id === "a")).toMatchObject({
      category: "decide",
      isPriority: false,
      isNext: false
    });
  });

  it("toggles priority only for Do thoughts", () => {
    const unmarked = thoughtReducer(startingThoughts, thoughtActions.togglePriority("a"));
    const ignored = thoughtReducer(startingThoughts, thoughtActions.togglePriority("c"));
    expect(unmarked[0].isPriority).toBe(false);
    expect(ignored).toBe(startingThoughts);
  });

  it("keeps exactly one selected Next item", () => {
    const next = thoughtReducer(startingThoughts, thoughtActions.selectNext("b"));
    expect(next.filter(({ isNext }) => isNext)).toEqual([
      expect.objectContaining({ id: "b" })
    ]);
  });

  it("clears, completes, and restores a Next item", () => {
    const cleared = thoughtReducer(startingThoughts, thoughtActions.clearNext("a"));
    expect(cleared[0].isNext).toBe(false);

    const completed = thoughtReducer(startingThoughts, thoughtActions.complete("a"));
    expect(completed[0]).toMatchObject({
      status: "completed",
      isPriority: false,
      isNext: false
    });
    expect(completed[0].completedAt).toEqual(expect.any(String));

    const restored = thoughtReducer(completed, thoughtActions.restore("a"));
    expect(restored[0]).toMatchObject({ status: "active", isPriority: false, isNext: false });
    expect(restored[0].completedAt).toBeUndefined();
  });
});
