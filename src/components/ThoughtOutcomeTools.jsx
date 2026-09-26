import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";

export default function ThoughtOutcomeTools({
  thought,
  onRecordDecision,
  onResolveDecision,
  onDismissThought
}) {
  const [decision, setDecision] = useState(thought.decision || "");

  useEffect(() => {
    setDecision(thought.decision || "");
  }, [thought.id, thought.decision]);

  if (thought.category === "let-go") {
    return (
      <div className="let-go-tools">
        <p>This thought will leave your active brain dump.</p>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<RemoveCircleOutlineRoundedIcon fontSize="small" />}
          onClick={onDismissThought}
        >
          Dismiss thought
        </Button>
      </div>
    );
  }

  if (thought.category !== "decide") return null;

  if (thought.decision) {
    return (
      <div className="decision-tools">
        <div className="decision-note">
          <span>Decision recorded</span>
          <p>{thought.decision}</p>
        </div>
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<CheckRoundedIcon fontSize="small" />}
          onClick={onResolveDecision}
        >
          Mark resolved
        </Button>
      </div>
    );
  }

  return (
    <form
      className="decision-form"
      onSubmit={(event) => {
        event.preventDefault();
        onRecordDecision(decision);
      }}
    >
      <TextField
        label="What did you decide?"
        value={decision}
        onChange={(event) => setDecision(event.target.value)}
        multiline
        minRows={2}
        fullWidth
        size="small"
        inputProps={{ maxLength: 300 }}
      />
      <Button
        type="submit"
        variant="contained"
        size="small"
        disabled={!decision.trim()}
      >
        Record decision
      </Button>
    </form>
  );
}
