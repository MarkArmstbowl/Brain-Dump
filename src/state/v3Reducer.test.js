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
