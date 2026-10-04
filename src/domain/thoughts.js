export const THOUGHT_STATUSES = ["active", "completed", "resolved", "dismissed", "saved", "archived"];
export function isActive(thought) { return !thought.status || thought.status === "active"; }
