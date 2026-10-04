import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { CATEGORIES } from "../constants";
import { buildInsights, sessionSummary } from "../domain/insights";

export default function ReviewInsights({ workspace, onSaveReflection }) {
  const current = workspace.dumps.find(({ id }) => id === workspace.currentId);
  const [reflection, setReflection] = useState(current.reflection || "");
  const insights = useMemo(() => buildInsights(workspace), [workspace]);
  return <section className="v3-panel" aria-labelledby="review-heading">
    <h2 id="review-heading">Review and reflect</h2>
    <h3>Current session summary</h3><p>{sessionSummary(current)}</p>
    <form onSubmit={(event) => { event.preventDefault(); onSaveReflection(reflection); }}>
      <TextField label="Personal reflection" multiline minRows={3} value={reflection} onChange={(event) => setReflection(event.target.value)} />
      <Button type="submit">Save reflection</Button>
    </form>
    <h3>Recurring topics</h3>
    <p>Repeated words across at least two dumps, excluding common words. These are simple topic clues; no thought text is sent to AI.</p>
    {!insights.recurring.length ? <p>No recurring topics across dumps yet.</p> : <ul>{insights.recurring.map((topic) =>
      <li key={topic.word}>{topic.word} — {topic.dumps} dumps, {topic.thoughts} thoughts</li>)}</ul>}
    <h3>Frequently deferred thoughts</h3>
    <p>Thoughts saved for later at least twice since deferral tracking began.</p>
    {!insights.deferred.length ? <p>No frequently deferred thoughts yet.</p> : <ul>{insights.deferred.map((thought) =>
      <li key={thought.id}>{thought.text} — deferred {thought.deferredCount} times ({thought.dumpTitle})</li>)}</ul>}
    <h3>Category trends</h3><p>Category counts per dump, including active and inactive thoughts.</p>
    <div className="table-scroll"><table><caption>Category distribution across dumps</caption>
      <thead><tr><th scope="col">Dump</th>{CATEGORIES.map(({ label, value }) => <th scope="col" key={value}>{label}</th>)}</tr></thead>
      <tbody>{insights.trends.map((row) => <tr key={row.id}><th scope="row">{row.title}</th>{CATEGORIES.map(({ value }) => <td key={value}>{row.categories[value]}</td>)}</tr>)}</tbody>
    </table></div>
    <h3>Completion trends</h3><p>Completion events and current outcomes per dump. Actions before event tracking began may be unavailable.</p>
    <div className="table-scroll"><table><caption>Completion and resolution across dumps</caption>
      <thead><tr><th scope="col">Dump</th><th scope="col">Completion events</th><th scope="col">Currently completed or archived</th><th scope="col">Currently resolved</th></tr></thead>
      <tbody>{insights.trends.map((row) => <tr key={row.id}><th scope="row">{row.title}</th><td>{row.completions}</td>
        <td>{row.completed + workspace.dumps.find(({ id }) => id === row.id).thoughts.filter((thought) => thought.status === "archived" && thought.archivedFrom === "completed").length}</td><td>{row.resolved}</td></tr>)}</tbody>
    </table></div>
    <details className="v3-panel"><summary>Review completed and resolved thoughts ({insights.review.length})</summary>
      {!insights.review.length ? <p>No completed or resolved thoughts yet.</p> : <ul>{insights.review.map((thought) =>
        <li key={`${thought.dumpId}-${thought.id}`}><p>{thought.text} — {thought.status} ({thought.dumpTitle})</p>
          {thought.decision && <p>Decision: {thought.decision}</p>}</li>)}</ul>}
    </details>
    <nav aria-label="General wellness resources">
      <h3>General wellness resources</h3>
      <ul><li><a href="https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/" target="_blank" rel="noopener noreferrer">NHS: Every Mind Matters — wellbeing tips</a></li>
        <li><a href="https://www.who.int/publications-detail-redirect/9789240003927" target="_blank" rel="noopener noreferrer">WHO: Doing What Matters in Times of Stress</a></li></ul>
    </nav>
  </section>;
}
