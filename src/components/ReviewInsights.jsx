import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { CATEGORIES } from "../constants";
import { buildInsights, sessionSummary } from "../domain/insights";

export default function ReviewInsights({ workspace, onSaveReflection }) {
  const current = workspace.dumps.find(({ id }) => id === workspace.currentId);
  const [reflection, setReflection] = useState(current.reflection || "");
  const insights = useMemo(() => buildInsights(workspace), [workspace]);
  const completed = current.thoughts.filter((thought) => thought.status === "completed" || (thought.status === "archived" && thought.archivedFrom === "completed")).length;
  const resolved = current.thoughts.filter((thought) => thought.status === "resolved").length;

  return <section className="review-page" aria-labelledby="review-heading">
    <header className="page-intro">
      <p className="section-kicker">NOTICE YOUR PROGRESS</p>
      <h2 id="review-heading">Review and reflect</h2>
      <p>A little perspective on what’s been on your mind, and what’s moving forward.</p>
    </header>
    <div className="review-metrics" aria-label="Current session totals">
      {[[current.thoughts.length, "Thoughts captured"], [completed, "Items completed"], [resolved, "Decisions resolved"]].map(([count, label]) =>
        <div className="metric-card" key={label}><strong>{count}</strong><span>{label}</span></div>)}
    </div>
    <div className="review-grid">
      <section className="surface-panel session-summary">
        <p className="section-kicker">A MOMENT TO PAUSE</p>
        <h3>Current session summary</h3><p>{sessionSummary(current)}</p>
        <form onSubmit={(event) => { event.preventDefault(); onSaveReflection(reflection); }}>
          <TextField label="Personal reflection" placeholder="What feels clearer? What would you like to carry forward?" multiline minRows={3} value={reflection} onChange={(event) => setReflection(event.target.value)} />
          <Button type="submit" variant="contained">Save reflection</Button>
        </form>
      </section>
      <div className="pattern-panels">
        <section className="surface-panel">
          <h3>Recurring topics</h3>
          <p className="panel-description">Repeated words across at least two dumps, excluding common words. These are simple topic clues; no thought text is sent to AI.</p>
          {!insights.recurring.length ? <p className="panel-empty">Your patterns will appear as you create more dumps.</p> : <ul className="topic-list">{insights.recurring.map((topic) =>
            <li key={topic.word}><strong>{topic.word}</strong><span>{topic.dumps} dumps · {topic.thoughts} thoughts</span></li>)}</ul>}
        </section>
        <section className="surface-panel">
          <h3>Frequently deferred thoughts</h3>
          <p className="panel-description">Thoughts saved for later at least twice since deferral tracking began.</p>
          {!insights.deferred.length ? <p className="panel-empty">No frequently deferred thoughts yet.</p> : <ul className="record-list">{insights.deferred.map((thought) =>
            <li key={thought.id}><p>{thought.text}</p><small>Deferred {thought.deferredCount} times · {thought.dumpTitle}</small></li>)}</ul>}
        </section>
      </div>
      <section className="surface-panel review-wide">
        <h3>Category trends</h3><p className="panel-description">Category counts per dump, including active and inactive thoughts.</p>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Category trends table"><table><caption>Category distribution across dumps</caption>
          <thead><tr><th scope="col">Dump</th>{CATEGORIES.map(({ label, value }) => <th scope="col" key={value}>{label}</th>)}</tr></thead>
          <tbody>{insights.trends.map((row) => <tr key={row.id}><th scope="row">{row.title}</th>{CATEGORIES.map(({ value }) => <td key={value}>{row.categories[value]}</td>)}</tr>)}</tbody>
        </table></div>
      </section>
      <section className="surface-panel review-wide">
        <h3>Completion trends</h3><p className="panel-description">Completion events and current outcomes per dump. Actions before event tracking began may be unavailable.</p>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Completion trends table"><table><caption>Completion and resolution across dumps</caption>
          <thead><tr><th scope="col">Dump</th><th scope="col">Completion events</th><th scope="col">Currently completed or archived</th><th scope="col">Currently resolved</th></tr></thead>
          <tbody>{insights.trends.map((row) => <tr key={row.id}><th scope="row">{row.title}</th><td>{row.completions}</td>
            <td>{row.completed + workspace.dumps.find(({ id }) => id === row.id).thoughts.filter((thought) => thought.status === "archived" && thought.archivedFrom === "completed").length}</td><td>{row.resolved}</td></tr>)}</tbody>
        </table></div>
      </section>
    </div>
    <details className="v3-panel"><summary>Review completed and resolved thoughts ({insights.review.length})</summary>
      {!insights.review.length ? <p className="panel-empty">No completed or resolved thoughts yet.</p> : <ul className="record-list">{insights.review.map((thought) =>
        <li key={`${thought.dumpId}-${thought.id}`}><p>{thought.text} — {thought.status} ({thought.dumpTitle})</p>
          {thought.decision && <p>Decision: {thought.decision}</p>}</li>)}</ul>}
    </details>
    <nav className="surface-panel wellness-panel" aria-label="General wellness resources">
      <div><p className="section-kicker">A LITTLE EXTRA SUPPORT</p><h3>General wellness resources</h3></div>
      <ul><li><a href="https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/" target="_blank" rel="noopener noreferrer">NHS: Every Mind Matters — wellbeing tips <ArrowOutwardRoundedIcon fontSize="small" /></a></li>
        <li><a href="https://www.who.int/publications-detail-redirect/9789240003927" target="_blank" rel="noopener noreferrer">WHO: Doing What Matters in Times of Stress <ArrowOutwardRoundedIcon fontSize="small" /></a></li></ul>
    </nav>
  </section>;
}
