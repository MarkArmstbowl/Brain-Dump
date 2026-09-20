import { CATEGORY_LABELS } from "../constants";

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
          (thought.category === undefined || CATEGORY_LABELS[thought.category]) &&
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
        const isNext = category === "do" && Boolean(thought.isNext) && !hasNext;
        if (isNext) hasNext = true;
        return {
          ...thought,
          category,
          isPriority: category === "do" && Boolean(thought.isPriority),
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
