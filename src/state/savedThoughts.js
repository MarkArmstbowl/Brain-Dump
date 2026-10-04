import { thoughtActions, thoughtReducer } from "./thoughtReducer";
import { updateCurrentDump } from "../storage/workspaceStorage";

export function savedThoughts(workspace) {
  return workspace.dumps.flatMap((dump) => dump.thoughts
    .filter((thought) => thought.status === "saved" && !thought.returnedToDumpId)
    .map((thought) => ({ ...thought, sourceDumpId: dump.id, dumpTitle: dump.title })));
}
export function updateSavedThought(workspace, id, action) {
  const source = workspace.dumps.find((dump) => dump.thoughts.some((thought) => thought.id === id && thought.status === "saved" && !thought.returnedToDumpId));
  if (!source) return workspace;
  const thoughts = thoughtReducer(source.thoughts, action);
  if (thoughts === source.thoughts) return workspace;
  return { ...workspace, dumps: workspace.dumps.map((dump) => dump.id === source.id ? { ...dump, thoughts } : dump) };
}
export function returnSavedThought(workspace, id) {
  const source = workspace.dumps.find((dump) => dump.thoughts.some((thought) => thought.id === id && thought.status === "saved" && !thought.returnedToDumpId));
  if (!source) return workspace;
  if (source.id === workspace.currentId) return updateSavedThought(workspace, id, thoughtActions.restore(id));
  const current = workspace.dumps.find((dump) => dump.id === workspace.currentId);
  if (current.thoughts.some((thought) => thought.id === id)) return workspace;
  const original = source.thoughts.find((thought) => thought.id === id);
  const restored = thoughtReducer([original], thoughtActions.restore(id))[0];
  const next = updateCurrentDump(workspace, [...current.thoughts, { ...restored, originDumpId: source.id }]);
  return { ...next, dumps: next.dumps.map((dump) => dump.id !== source.id ? dump : {
    ...dump, thoughts: dump.thoughts.map((thought) => thought.id === id ? {
      ...thought, returnedToDumpId: workspace.currentId, returnedAt: restored.updatedAt
    } : thought)
  }) };
}
