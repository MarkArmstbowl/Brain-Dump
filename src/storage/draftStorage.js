import { CATEGORY_LABELS } from "../constants";

const KEY = "brain-dump-drafts";
export function loadDrafts() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (!value || !Array.isArray(value.drafts) || !value.drafts.length ||
      !value.drafts.every((draft) => draft && typeof draft.id === "string" &&
        typeof draft.text === "string" && Object.hasOwn(CATEGORY_LABELS, draft.category)) ||
      new Set(value.drafts.map(({ id }) => id)).size !== value.drafts.length) return null;
    return { drafts: value.drafts, pastedText: typeof value.pastedText === "string" ? value.pastedText : "",
      pasteOpen: Boolean(value.pasteOpen) };
  } catch { return null; }
}
export function saveDrafts(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
    return "";
  } catch { return "Unfinished input could not be saved. Keep this page open to avoid losing it."; }
}
