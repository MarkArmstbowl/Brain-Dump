import Button from "@mui/material/Button";
import ThoughtTimestamps from "./ThoughtTimestamps";

export default function SavedThoughts({ thoughts, onRestore, onSetDate }) {
  if (!thoughts.length) return null;
  return <details className="v3-panel">
    <summary>Saved for later ({thoughts.length})</summary>
    <p>Revisit reminders appear while the app is open, or when you reopen it after the date.</p>
    <ul>{thoughts.map((thought) => <li key={thought.id}>
      <p>{thought.text}</p>
      {thought.dumpTitle && <small>From {thought.dumpTitle}</small>}
      <ThoughtTimestamps thought={thought} />
      <label>Revisit date<input type="date" aria-label={`Revisit date for ${thought.text}`} value={thought.revisitDate || ""}
        onChange={(event) => onSetDate(thought.id, event.target.value)} /></label>
      <Button onClick={() => onRestore(thought.id)}>Return to active</Button>
    </li>)}</ul>
  </details>;
}
