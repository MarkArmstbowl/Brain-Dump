import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function ThoughtLifecycleTools({ thought, onComplete, onRecordDecision, onResolve, onDismiss, onSaveLater }) {
  const [saving, setSaving] = useState(false);
  const [revisitDate, setRevisitDate] = useState("");
  const [recording, setRecording] = useState(false);
  const [decision, setDecision] = useState(thought.decision || "");
  return <div className="lifecycle-tools">
    <Button onClick={() => setSaving(true)}>Save for later</Button>
    {saving && <form onSubmit={(event) => { event.preventDefault(); onSaveLater(thought.id, revisitDate); setSaving(false); }}>
      <label>Revisit date (optional)<input type="date" aria-label="Revisit date" value={revisitDate} onChange={(event) => setRevisitDate(event.target.value)} /></label>
      <Button type="submit">Save thought for later</Button>
      <Button onClick={() => setSaving(false)}>Cancel saving</Button>
    </form>}
    {thought.category === "do" && <Button onClick={() => onComplete(thought.id)}>Mark complete</Button>}
    {thought.category === "let-go" && <Button onClick={() => onDismiss(thought.id)}>Dismiss thought</Button>}
    {thought.category === "decide" && <>
      {thought.decision && <p><strong>Decision:</strong> {thought.decision}</p>}
      <Button onClick={() => { setDecision(thought.decision || ""); setRecording(true); }}>{thought.decision ? "Edit decision" : "Record decision"}</Button>
      <Button disabled={!thought.decision?.trim()} onClick={() => onResolve(thought.id)}>Mark resolved</Button>
      {recording && <form onSubmit={(event) => {
        event.preventDefault();
        if (!decision.trim()) return;
        onRecordDecision(thought.id, decision); setRecording(false);
      }}>
        <TextField label="Decision outcome" value={decision} onChange={(event) => setDecision(event.target.value)} multiline />
        <Button type="submit" disabled={!decision.trim()}>Save decision</Button>
        <Button onClick={() => setRecording(false)}>Cancel decision</Button>
      </form>}
    </>}
  </div>;
}
