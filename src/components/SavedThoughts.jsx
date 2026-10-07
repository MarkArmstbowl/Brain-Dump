import Button from "@mui/material/Button";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import KeyboardReturnRoundedIcon from "@mui/icons-material/KeyboardReturnRounded";
import { CATEGORY_LABELS } from "../constants";

export default function SavedThoughts({ thoughts, onReturn }) {
  if (thoughts.length === 0) return null;

  return (
    <details className="saved-drawer">
      <summary>
        <BookmarkBorderRoundedIcon aria-hidden="true" fontSize="small" />
        <span>Saved for later</span>
        <span className="saved-count">{thoughts.length}</span>
      </summary>
      <div className="saved-list">
        {thoughts.map((thought) => (
          <div className="saved-item" key={thought.id}>
            <div>
              <p>{thought.text}</p>
              <span>{CATEGORY_LABELS[thought.category]}</span>
            </div>
            <Button
              variant="text"
              size="small"
              startIcon={<KeyboardReturnRoundedIcon fontSize="small" />}
              onClick={() => onReturn(thought.id)}
            >
              Return to active
            </Button>
          </div>
        ))}
      </div>
    </details>
  );
}
