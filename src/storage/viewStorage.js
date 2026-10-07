const ACTIVE_VIEW_KEY = "brain-dump-active-view";

const VIEWS = ["capture", "organize", "history", "review"];

export function loadActiveView() {
  try {
    const view = localStorage.getItem(ACTIVE_VIEW_KEY);
    return VIEWS.includes(view) ? view : "capture";
  } catch {
    return "capture";
  }
}

export function saveActiveView(view) {
  try {
    localStorage.setItem(ACTIVE_VIEW_KEY, VIEWS.includes(view) ? view : "capture");
  } catch {
    // Losing a view preference should not block the thought workflow.
  }
}
