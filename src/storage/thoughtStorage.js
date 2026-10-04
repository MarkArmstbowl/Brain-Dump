import { CATEGORY_LABELS, getPriority, PRIORITY_LEVELS } from "../constants";

const STORAGE_KEY = "brain-dump-thoughts";

export const LOAD_ERROR =
  "Your saved thoughts couldn't be loaded. You can still capture thoughts here, but your next successful change will replace the saved list.";

export const SAVE_ERROR =
  "Your changes are visible, but couldn't be saved in this browser. Keep this page open to avoid losing them.";

export function loadThoughts() {
  try {
    const savedThoughts = localStorage.getItem(STORAGE_KEY);
    if (savedThoughts === null) {
      return { thoughts: [], error: "" };
    }

    const parsedThoughts = JSON.parse(savedThoughts);
    const hasValidShape =
      Array.isArray(parsedThoughts) &&
      parsedThoughts.every(
        (thought) =>
          thought &&
          typeof thought.id === "string" &&
          typeof thought.text === "string" &&
          thought.text.trim() &&
          (thought.category === undefined || Object.hasOwn(CATEGORY_LABELS, thought.category)) &&
          (thought.status === undefined || ["active", "completed"].includes(thought.status)) &&
          (thought.completedAt === undefined || typeof thought.completedAt === "string") &&
          (thought.priority === undefined || PRIORITY_LEVELS.includes(thought.priority)) &&
          (thought.isPriority === undefined || typeof thought.isPriority === "boolean") &&
          (thought.isNext === undefined || typeof thought.isNext === "boolean")
      ) &&
      new Set(parsedThoughts.map((thought) => thought.id)).size ===
        parsedThoughts.length;

    if (!hasValidShape) {
      throw new Error("Invalid saved thoughts");
    }

    let hasNext = false;
    return {
      thoughts: parsedThoughts.map((thought) => {
        const category = thought.category || "unsorted";
        const status = thought.status || "active";
        const isNext =
          status !== "completed" &&
          category === "do" &&
          Boolean(thought.isNext) &&
          !hasNext;
        if (isNext) hasNext = true;
        return {
          ...thought,
          category,
          status,
          priority: status !== "completed" && category === "do" ? getPriority(thought) : "none",
          isPriority:
            status !== "completed" &&
            category === "do" &&
            getPriority(thought) !== "none",
          isNext
        };
      }),
      error: ""
    };
  } catch {
    return { thoughts: [], error: LOAD_ERROR };
  }
}

export function saveThoughts(thoughts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
    return "";
  } catch {
    return SAVE_ERROR;
  }
}
