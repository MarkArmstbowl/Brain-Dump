import { THOUGHT_STATUSES, validRevisitDate } from "../domain/thoughts";
import { CATEGORY_LABELS, getPriority, PRIORITY_LEVELS } from "../constants";

export const THOUGHT_STORAGE_KEY = "brain-dump-thoughts";
export const LOAD_ERROR = "Your saved thoughts couldn't be loaded. You can still capture thoughts here, but your next successful change will replace the saved list.";
export const SAVE_ERROR = "Your changes are visible, but couldn't be saved in this browser. Keep this page open to avoid losing them.";

export function normalizeThoughts(value) {
  const valid = Array.isArray(value) && value.every((thought) => thought &&
    typeof thought.id === "string" && thought.id && typeof thought.text === "string" && thought.text.trim() &&
    (thought.category === undefined || Object.hasOwn(CATEGORY_LABELS, thought.category)) &&
    (thought.status === undefined || THOUGHT_STATUSES.includes(thought.status)) &&
    ["createdAt", "updatedAt", "completedAt", "resolvedAt", "dismissedAt", "savedAt", "decision", "returnedAt", "returnedToDumpId", "originDumpId"].every((key) => thought[key] === undefined || typeof thought[key] === "string") &&
    (thought.revisitDate === undefined || validRevisitDate(thought.revisitDate)) &&
    (thought.reminderAcknowledgedDate === undefined || validRevisitDate(thought.reminderAcknowledgedDate)) &&
    (thought.deferredCount === undefined || Number.isInteger(thought.deferredCount) && thought.deferredCount >= 0) &&
    (thought.events === undefined || Array.isArray(thought.events) && thought.events.every((event) => event && typeof event.type === "string" && typeof event.at === "string")) &&
    (thought.priority === undefined || PRIORITY_LEVELS.includes(thought.priority)) &&
    (thought.isPriority === undefined || typeof thought.isPriority === "boolean") &&
    (thought.isNext === undefined || typeof thought.isNext === "boolean")) &&
    new Set(value.map(({ id }) => id)).size === value.length;
  if (!valid) throw new Error("Invalid saved thoughts");
  let hasNext = false;
  return value.map((thought) => {
    const category = thought.category || "unsorted";
    const status = thought.status || "active";
    const priority = status === "active" && category === "do" ? getPriority(thought) : "none";
    const isNext = status === "active" && category === "do" && Boolean(thought.isNext) && !hasNext;
    if (isNext) hasNext = true;
    return { ...thought, category, status, priority, isPriority: priority !== "none", isNext };
  });
}
export function loadThoughts() {
  try {
    const saved = localStorage.getItem(THOUGHT_STORAGE_KEY);
    return { thoughts: saved === null ? [] : normalizeThoughts(JSON.parse(saved)), error: "" };
  } catch { return { thoughts: [], error: LOAD_ERROR }; }
}
export function saveThoughts(thoughts) {
  try { localStorage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify(thoughts)); return ""; }
  catch { return SAVE_ERROR; }
}
