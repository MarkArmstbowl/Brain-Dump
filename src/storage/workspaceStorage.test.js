import { beforeEach, expect, it, vi } from "vitest";
import { BACKUP_KEY, WORKSPACE_KEY, loadWorkspace, saveWorkspace, startDump, updateCurrentDump } from "./workspaceStorage";
import { filterHistory } from "../domain/history";
beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
it("migrates the legacy list without inventing timestamps and retains an exact backup", () => {
  const old = JSON.stringify([{ id: "old", text: "Legacy", category: "do", isPriority: true }]);
  localStorage.setItem("brain-dump-thoughts", old);
  const loaded = loadWorkspace();
  expect(loaded.thoughts[0]).toMatchObject({ id: "old", priority: "medium" });
  expect(loaded.thoughts[0].createdAt).toBeUndefined();
  expect(saveWorkspace(loaded.workspace)).toBe("");
  expect(localStorage.getItem(BACKUP_KEY)).toBe(old);
  expect(loadWorkspace().workspace.currentId).toBe(loaded.workspace.currentId);
});
it("keeps previous dumps intact through new sessions and reload, and filters history", () => {
  let { workspace } = loadWorkspace();
  workspace = updateCurrentDump(workspace, [
    { id: "a", text: "Email professor", category: "do", status: "completed" },
    { id: "b", text: "Choose class", category: "decide", status: "resolved", decision: "Art" }
  ]);
  const previousId = workspace.currentId;
  workspace = startDump(workspace, "Second dump");
  expect(saveWorkspace(workspace)).toBe("");
  const reloaded = loadWorkspace();
  expect(reloaded.thoughts).toEqual([]);
  expect(reloaded.workspace.dumps.find(({ id }) => id === previousId).thoughts).toHaveLength(2);
  expect(filterHistory(reloaded.workspace, { search: "professor", category: "do", status: "completed" })[0].matchedThoughts.map(({ id }) => id)).toEqual(["a"]);
  expect(filterHistory(reloaded.workspace, { search: "Art", category: "decide" })[0].matchedThoughts[0].id).toBe("b");
  expect(filterHistory(reloaded.workspace, { from: "2099-01-01" })).toEqual([]);
});
it("does not overwrite corrupt history or silently replace it with the legacy cache", () => {
  localStorage.setItem(WORKSPACE_KEY, "broken");
  localStorage.setItem("brain-dump-thoughts", "[]");
  expect(loadWorkspace().blocked).toBe(true);
  expect(localStorage.getItem(WORKSPACE_KEY)).toBe("broken");
});
it("reports storage failures instead of claiming history was saved", () => {
  const { workspace } = loadWorkspace();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota"); });
  expect(saveWorkspace(workspace)).toContain("couldn't be saved");
});

it("keeps the workspace authoritative if the compatibility cache cannot be written", () => {
  const { workspace } = loadWorkspace();
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (key, value) {
    if (key === "brain-dump-thoughts") throw new Error("Cache full");
    return original.call(this, key, value);
  });
  expect(saveWorkspace(workspace)).toBe("");
  expect(loadWorkspace().workspace.currentId).toBe(workspace.currentId);
});

it("allows in-memory capture when storage is inaccessible rather than treating it as corrupt history", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Disabled"); });
  expect(loadWorkspace()).toMatchObject({ thoughts: [], blocked: false });
});
