import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { CATEGORIES, CATEGORY_LABELS } from "../constants";
import { THOUGHT_STATUSES } from "../domain/thoughts";
import { filterHistory } from "../domain/history";
import ThoughtTimestamps from "./ThoughtTimestamps";

export default function DumpHistory({ workspace, onStart }) {
  const [title, setTitle] = useState("");
  const [filters, setFilters] = useState({ search: "", category: "all", status: "all", from: "", to: "" });
  const [openedId, setOpenedId] = useState(null);
  const matches = filterHistory(workspace, filters);
  const opened = matches.find(({ id }) => id === openedId);
  const change = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  return <section className="history-page" aria-labelledby="history-heading">
    <header className="page-intro">
      <p className="section-kicker">YOUR THOUGHTS, OVER TIME</p>
      <h2 id="history-heading">Brain dump history</h2>
      <p>Return to an earlier moment, or make room for a fresh start.</p>
    </header>
    <form className="surface-panel new-dump-form" onSubmit={(event) => { event.preventDefault(); if (onStart(title)) { setTitle(""); setOpenedId(null); } }}>
      <div><h3>Start with a clear page</h3><p className="panel-description">Starting a new dump saves the entire current dump here, including inactive thoughts. Unfinished capture input stays available.</p></div>
      <div className="new-dump-controls"><TextField label="New dump name" placeholder="e.g. Monday morning" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />}>Start new dump</Button></div>
    </form>
    <div className="surface-panel history-search-panel">
      <h3>Find a past thought</h3>
      <div className="history-filters">
        <TextField label="Search previous thoughts" value={filters.search} onChange={(event) => change("search", event.target.value)} />
        <label>History category<select aria-label="History category" value={filters.category} onChange={(event) => change("category", event.target.value)}>
          <option value="all">All categories</option>{CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>History status<select aria-label="History status" value={filters.status} onChange={(event) => change("status", event.target.value)}>
          <option value="all">All statuses</option>{THOUGHT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select></label>
        <label>From date<input aria-label="History from date" type="date" value={filters.from} onChange={(event) => change("from", event.target.value)} /></label>
        <label>To date<input aria-label="History to date" type="date" value={filters.to} onChange={(event) => change("to", event.target.value)} /></label>
      </div>
      {filters.from && filters.to && filters.from > filters.to && <p className="error-message" role="alert">From date must be on or before To date.</p>}
    </div>
    {!matches.length && <div className="empty-state"><HistoryRoundedIcon className="empty-mark" fontSize="large" /><h3>No previous dumps match these filters.</h3><p>Start a new dump to preserve this session, or adjust your filters.</p></div>}
    <ul className="history-list">{matches.map((dump) => <li key={dump.id} className={`history-card${openedId === dump.id ? " is-open" : ""}`}>
      <span className="history-icon" aria-hidden="true"><HistoryRoundedIcon /></span>
      <div><h3>{dump.title}</h3><p>{new Date(dump.startedAt).toLocaleString()} · {dump.matchedThoughts.length} matching thoughts</p></div>
      <Button variant="outlined" endIcon={<ArrowForwardRoundedIcon />} aria-label={`Open dump ${dump.title}`} onClick={() => setOpenedId(dump.id)} aria-expanded={openedId === dump.id}>Open dump</Button>
    </li>)}</ul>
    {opened && <section className="surface-panel opened-dump" aria-label="Opened previous dump">
      <div className="section-heading"><div><p className="section-kicker">PREVIOUS SESSION</p><h3>{opened.title}</h3></div><Button variant="outlined" onClick={() => setOpenedId(null)}>Close previous dump</Button></div>
      <p className="panel-description">Read-only previous dump. Filters apply to the list below.</p>
      {opened.reflection && <p className="history-reflection">Reflection: {opened.reflection}</p>}
      <ul className="record-list">{opened.matchedThoughts.map((thought) => <li key={thought.id}>
        <p>{thought.text}</p><span className={`category-badge category-${thought.category}`}>{CATEGORY_LABELS[thought.category]}</span> <small>{thought.status}</small>
        {thought.decision && <p>Decision: {thought.decision}</p>}
        {thought.returnedToDumpId && <p>Returned to a newer dump.</p>}
        <ThoughtTimestamps thought={thought} />
      </li>)}</ul>
    </section>}
  </section>;
}
