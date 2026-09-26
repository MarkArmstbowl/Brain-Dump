const ACTIVE_VIEW_KEY = "brain-dump-active-view";

export function loadActiveView() {
  try {
    return localStorage.getItem(ACTIVE_VIEW_KEY) === "organize"
      ? "organize"
      : "capture";
  } catch {
    return "capture";
  }
}

export function saveActiveView(view) {
  try {
    localStorage.setItem(
      ACTIVE_VIEW_KEY,
      view === "organize" ? "organize" : "capture"
    );
  } catch {
    // Losing a view preference should not block the thought workflow.
  }
}
