import Button from "@mui/material/Button";
import ThoughtTimestamps from "./ThoughtTimestamps";

export default function ThoughtCollections({ thoughts, onRestore, onUnarchive }) {
  return [["resolved", "Resolved decisions"], ["dismissed", "Dismissed thoughts"], ["archived", "Archived completed items"]]
    .map(([status, title]) => {
      const items = thoughts.filter((thought) => thought.status === status);
      if (!items.length) return null;
      return <details className="v3-panel" key={status}>
        <summary>{title} ({items.length})</summary>
        <ul>{items.map((thought) => <li key={thought.id}>
          <p>{thought.text}</p>
          {thought.decision && <p>Decision: {thought.decision}</p>}
          <ThoughtTimestamps thought={thought} />
          <Button onClick={() => status === "archived" ? onUnarchive(thought.id) : onRestore(thought.id)}>
            {status === "resolved" ? "Reopen decision" : status === "archived" ? "Return to Completed" : "Restore dismissed thought"}
          </Button>
        </li>)}</ul>
      </details>;
    });
}
