import { loadThoughts, normalizeThoughts, THOUGHT_STORAGE_KEY, SAVE_ERROR } from "./thoughtStorage";

export const WORKSPACE_KEY = "brain-dump-workspace-v3";
export const BACKUP_KEY = "brain-dump-before-history";
export const HISTORY_LOAD_ERROR = "Saved dump history could not be loaded. It has been left untouched. Reload after recovering browser storage before making changes.";
export function createWorkspace(thoughts = []) {
  const id = crypto.randomUUID();
  return { version: 1, currentId: id, dumps: [{ id, title: thoughts.length ? "Imported dump" : "First dump",
    startedAt: new Date().toISOString(), thoughts, reflection: "" }] };
}
export function normalizeWorkspace(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.dumps) || !value.dumps.length ||
    typeof value.currentId !== "string" || !value.dumps.some(({ id }) => id === value.currentId) ||
    new Set(value.dumps.map(({ id }) => id)).size !== value.dumps.length) throw new Error("Invalid history");
  return { ...value, dumps: value.dumps.map((dump) => {
    if (!dump || typeof dump.id !== "string" || !dump.id || typeof dump.title !== "string" || !dump.title.trim() ||
      typeof dump.startedAt !== "string" || !Number.isFinite(Date.parse(dump.startedAt)) ||
      dump.closedAt !== undefined && !Number.isFinite(Date.parse(dump.closedAt)) ||
      dump.reflection !== undefined && typeof dump.reflection !== "string") throw new Error("Invalid dump");
    return { ...dump, reflection: dump.reflection || "", thoughts: normalizeThoughts(dump.thoughts) };
  }) };
}
export function loadWorkspace() {
  try {
    const saved = localStorage.getItem(WORKSPACE_KEY);
    if (saved !== null) {
      const workspace = normalizeWorkspace(JSON.parse(saved));
      return { workspace, thoughts: workspace.dumps.find(({ id }) => id === workspace.currentId).thoughts, error: "", blocked: false };
    }
    const legacy = loadThoughts();
    const workspace = createWorkspace(legacy.thoughts);
    return { workspace, thoughts: legacy.thoughts, error: legacy.error, blocked: false };
  } catch {
    const workspace = createWorkspace();
    return { workspace, thoughts: [], error: HISTORY_LOAD_ERROR, blocked: true };
  }
}
export function saveWorkspace(workspace) {
  try {
    const current = workspace.dumps.find(({ id }) => id === workspace.currentId);
    if (!current) throw new Error("No current dump");
    const legacy = localStorage.getItem(THOUGHT_STORAGE_KEY);
    if (legacy !== null && localStorage.getItem(BACKUP_KEY) === null) localStorage.setItem(BACKUP_KEY, legacy);
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
    try { localStorage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify(current.thoughts)); }
    catch { return "Your history was saved, but the older-version thought cache could not be updated."; }
    return "";
  } catch { return SAVE_ERROR; }
}
export function updateCurrentDump(workspace, thoughts) {
  return { ...workspace, dumps: workspace.dumps.map((dump) => dump.id === workspace.currentId ? { ...dump, thoughts } : dump) };
}
export function startDump(workspace, title) {
  const id = crypto.randomUUID();
  const at = new Date().toISOString();
  return { ...workspace, currentId: id, dumps: [
    ...workspace.dumps.map((dump) => dump.id === workspace.currentId ? { ...dump, closedAt: at } : dump),
    { id, title: title.trim() || `Dump ${workspace.dumps.length + 1}`, startedAt: at, thoughts: [], reflection: "" }
  ] };
}
