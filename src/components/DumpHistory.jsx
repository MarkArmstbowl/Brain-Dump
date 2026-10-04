import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
  return <section className="v3-panel" aria-labelledby="history-heading">
    <h2 id="history-heading">Brain dump history</h2>
    <form onSubmit={(event) => { event.preventDefault(); if (onStart(title)) { setTitle(""); setOpenedId(null); } }}>
      <TextField label="New dump name" value={title} onChange={(event) => setTitle(event.target.value)} />
      <p>Starting a new dump saves the entire current dump here, including inactive thoughts. Unfinished capture input stays available.</p>
      <Button type="submit">Start new dump</Button>
    </form>
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
    {filters.from && filters.to && filters.from > filters.to && <p role="alert">From date must be on or before To date.</p>}
    {!matches.length && <p>No previous dumps match these filters.</p>}
    <ul>{matches.map((dump) => <li key={dump.id}>
      <strong>{dump.title}</strong> — {new Date(dump.startedAt).toLocaleString()} — {dump.matchedThoughts.length} matching thoughts
      <Button aria-label={`Open dump ${dump.title}`} onClick={() => setOpenedId(dump.id)}>Open dump</Button>
    </li>)}</ul>
    {opened && <section aria-label="Opened previous dump">
      <h3>{opened.title}</h3>
      <p>Read-only previous dump. Filters apply to the list below.</p>
      {opened.reflection && <p>Reflection: {opened.reflection}</p>}
      <ul>{opened.matchedThoughts.map((thought) => <li key={thought.id}>
        <p>{thought.text}</p><p>{CATEGORY_LABELS[thought.category]} · {thought.status}</p>
        {thought.decision && <p>Decision: {thought.decision}</p>}
        <ThoughtTimestamps thought={thought} />
      </li>)}</ul>
      <Button onClick={() => setOpenedId(null)}>Close previous dump</Button>
    </section>}
  </section>;
}
