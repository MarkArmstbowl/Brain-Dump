import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { dueThoughts, localDate } from "../domain/thoughts";

export default function ThoughtReminders({ thoughts, onRestore, onAcknowledge }) {
  const [today, setToday] = useState(localDate);
  useEffect(() => {
    const refresh = () => setToday(localDate());
    const interval = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(interval); window.removeEventListener("focus", refresh); };
  }, []);
  return dueThoughts(thoughts, today).map((thought) => <Alert key={thought.id} severity="info" className="revisit-reminder"
    action={<><Button onClick={() => onRestore(thought.id)}>Return to active</Button>
      <Button onClick={() => onAcknowledge(thought.id)}>Dismiss reminder</Button></>}>
    Revisit reminder: {thought.text} — due {thought.revisitDate}
  </Alert>);
}
