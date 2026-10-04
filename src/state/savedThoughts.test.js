import { expect, it } from "vitest";
import { savedThoughts, returnSavedThought, updateSavedThought } from "./savedThoughts";
import { thoughtActions } from "./thoughtReducer";
const workspace = { currentId: "new", dumps: [
  { id: "old", title: "Old", thoughts: [{ id: "s", text: "Trip", category: "do", status: "saved", revisitDate: "2026-10-01", deferredCount: 1 }] },
  { id: "new", title: "New", thoughts: [] }
] };
it("remembers reminders from past dumps and returns the thought without losing its history", () => {
  expect(savedThoughts(workspace)).toHaveLength(1);
  const updated = returnSavedThought(workspace, "s");
  expect(updated.dumps[1].thoughts[0]).toMatchObject({ id: "s", status: "active", deferredCount: 1, originDumpId: "old" });
  expect(updated.dumps[1].thoughts[0].revisitDate).toBeUndefined();
  expect(updated.dumps[0].thoughts[0]).toMatchObject({ status: "saved", text: "Trip", returnedToDumpId: "new" });
  expect(savedThoughts(updated)).toEqual([]);
  expect(returnSavedThought(updated, "s")).toBe(updated);
  expect(workspace.dumps[0].thoughts[0].returnedToDumpId).toBeUndefined();
});
it("acknowledges past-dump reminders in their source dump", () => {
  const updated = updateSavedThought(workspace, "s", thoughtActions.acknowledgeReminder("s"));
  expect(updated.dumps[0].thoughts[0].reminderAcknowledgedDate).toBe("2026-10-01");
  expect(updated.dumps[1].thoughts).toEqual([]);
});
