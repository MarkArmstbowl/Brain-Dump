import { localDate } from "./thoughts";
export function filterHistory(workspace, { search = "", category = "all", status = "all", from = "", to = "" } = {}) {
  const query = search.trim().toLocaleLowerCase();
  return workspace.dumps.filter((dump) => dump.id !== workspace.currentId).flatMap((dump) => {
    const day = localDate(new Date(dump.startedAt));
    if (from && day < from || to && day > to) return [];
    const titleMatches = dump.title.toLocaleLowerCase().includes(query);
    const thoughts = dump.thoughts.filter((thought) => (category === "all" || thought.category === category) &&
      (status === "all" || (thought.status || "active") === status) &&
      (!query || titleMatches || `${thought.text} ${thought.decision || ""}`.toLocaleLowerCase().includes(query)));
    if (!thoughts.length && (query && !titleMatches || category !== "all" || status !== "all")) return [];
    return [{ ...dump, matchedThoughts: thoughts }];
  }).reverse();
}
