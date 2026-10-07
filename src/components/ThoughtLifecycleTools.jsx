import { useState } from "react";
import Button from "@mui/material/Button";

export default function ThoughtLifecycleTools({ thought, onComplete, onSaveLater }) {
  const [saving, setSaving] = useState(false);
  const [revisitDate, setRevisitDate] = useState("");
  return <div className="lifecycle-tools">
    <Button onClick={() => setSaving(true)}>Set revisit date</Button>
    {saving && <form onSubmit={(event) => { event.preventDefault(); onSaveLater(thought.id, revisitDate); setSaving(false); }}>
      <label>Revisit date (optional)<input type="date" aria-label="Revisit date" value={revisitDate} onChange={(event) => setRevisitDate(event.target.value)} /></label>
      <Button type="submit">Save thought for later</Button>
      <Button onClick={() => setSaving(false)}>Cancel saving</Button>
    </form>}
    {thought.category === "do" && <Button onClick={() => onComplete(thought.id)}>Mark complete</Button>}
  </div>;
}
