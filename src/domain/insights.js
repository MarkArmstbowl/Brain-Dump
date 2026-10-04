import { CATEGORIES } from "../constants";
import { isActive } from "./thoughts";

const STOP_WORDS = new Set("about after again also another been before being both could does doing done down each email from have into just later make more much myself need next only other over really should some something than that their them then there these they thing this those through thought thoughts today tomorrow very want were what when where which while will with would your finish start send".split(" "));
export function sessionStats(dump) {
  const counts = { active: 0, completed: 0, resolved: 0, dismissed: 0, saved: 0, archived: 0 };
  for (const thought of dump.thoughts) counts[thought.status || "active"] += 1;
  return { ...counts, total: dump.thoughts.length };
}
export function completionEvents(thought, startedAt) {
  const recorded = (thought.events || []).filter((event) => event.type === "completed" && event.from !== "archived" &&
    (!thought.originDumpId || Date.parse(event.at) >= Date.parse(startedAt))).length;
  return recorded || (thought.completedAt && ["completed", "archived"].includes(thought.status) ? 1 : 0);
}
export function buildInsights(workspace) {
  const topics = new Map();
  const deferred = new Map();
  const review = [];
  const trends = workspace.dumps.map((dump) => {
    const categories = Object.fromEntries(CATEGORIES.map(({ value }) => [value, 0]));
    let completions = 0;
    for (const thought of dump.thoughts) {
      categories[thought.category || "unsorted"] += 1;
      completions += completionEvents(thought, dump.startedAt);
      const words = new Set(thought.text.toLocaleLowerCase().match(/[\p{L}][\p{L}\p{N}']{2,}/gu) || []);
      for (const word of words) {
        if (STOP_WORDS.has(word)) continue;
        const topic = topics.get(word) || { word, dumps: new Set(), thoughts: new Set() };
        topic.dumps.add(dump.id); topic.thoughts.add(thought.id); topics.set(word, topic);
      }
      if ((thought.deferredCount || 0) >= 2) {
        const existing = deferred.get(thought.id);
        if (!existing || existing.deferredCount <= thought.deferredCount) deferred.set(thought.id, { ...thought, dumpTitle: dump.title });
      }
      if (["completed", "resolved"].includes(thought.status) || thought.status === "archived" && thought.archivedFrom === "completed") {
        review.push({ ...thought, dumpTitle: dump.title, dumpId: dump.id });
      }
    }
    return { id: dump.id, title: dump.title, startedAt: dump.startedAt, categories, completions, ...sessionStats(dump) };
  });
  return { trends,
    recurring: [...topics.values()].filter((topic) => topic.dumps.size >= 2)
      .map((topic) => ({ word: topic.word, dumps: topic.dumps.size, thoughts: topic.thoughts.size }))
      .sort((a, b) => b.dumps - a.dumps || b.thoughts - a.thoughts || a.word.localeCompare(b.word)).slice(0, 10),
    deferred: [...deferred.values()].sort((a, b) => b.deferredCount - a.deferredCount), review };
}
export function sessionSummary(dump) {
  const stats = sessionStats(dump);
  const completed = stats.completed + dump.thoughts.filter((thought) => thought.status === "archived" && thought.archivedFrom === "completed").length;
  const next = dump.thoughts.find((thought) => isActive(thought) && thought.isNext);
  return `${stats.total} thoughts in this dump: ${stats.active} active, ${completed} completed, ${stats.resolved} resolved, ${stats.dismissed} dismissed, and ${stats.saved} saved for later.${next ? ` Next: ${next.text}` : " No Next item selected."}`;
}
