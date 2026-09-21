import Button from "@mui/material/Button";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import { CATEGORY_LABELS } from "../constants";

export default function CompletedThoughts({ thoughts, onRestore }) {
  if (thoughts.length === 0) return null;

  return (
    <details className="completed-drawer">
      <summary>
        <span>Completed</span>
        <span className="completed-count">{thoughts.length}</span>
      </summary>
      <div className="completed-list">
        {thoughts.map((thought) => (
          <div className="completed-item" key={thought.id}>
            <div>
              <p>{thought.text}</p>
              <span>{CATEGORY_LABELS[thought.category]}</span>
            </div>
            <Button
              variant="text"
              size="small"
              startIcon={<RestoreRoundedIcon fontSize="small" />}
              onClick={() => onRestore(thought.id)}
            >
              Restore
            </Button>
          </div>
        ))}
      </div>
    </details>
  );
}
