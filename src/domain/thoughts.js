export const THOUGHT_STATUSES = ["active", "completed", "resolved", "dismissed", "saved", "archived"];
export function isActive(thought) { return !thought.status || thought.status === "active"; }

export function validRevisitDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dueThoughts(thoughts, today = localDate()) {
  return thoughts.filter((thought) => thought.status === "saved" && validRevisitDate(thought.revisitDate) &&
    thought.revisitDate <= today && thought.reminderAcknowledgedDate !== thought.revisitDate);
}
