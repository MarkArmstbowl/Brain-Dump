import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { CATEGORY_LABELS } from "../constants";
import CategorySelect from "./CategorySelect";

export default function CategorySuggestion({
  thought,
  aiState,
  onRequestSuggestion,
  onAcceptSuggestion,
  onOverrideSuggestion
}) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState("unsorted");

  useEffect(() => {
    setShowOverride(false);
  }, [aiState?.suggestion?.category]);

  return (
    <div className="ai-category-tools">
      {!aiState?.suggestion && (
        <Button
          variant="outlined"
          size="small"
          startIcon={
            aiState?.loading
              ? <CircularProgress size={14} color="inherit" />
              : <AutoAwesomeRoundedIcon fontSize="small" />
          }
          disabled={aiState?.loading}
          onClick={onRequestSuggestion}
          className="ai-suggest-button"
        >
          {aiState?.loading ? "Thinking…" : "Suggest category"}
        </Button>
      )}

      {aiState?.error && <p className="ai-error" role="alert">{aiState.error}</p>}

      {aiState?.suggestion && (
        <div className="ai-suggestion" aria-label="AI category suggestion">
          <p className="ai-suggestion-label">
            <AutoAwesomeRoundedIcon
              aria-hidden="true"
              fontSize="inherit"
              sx={{ fontSize: "0.95em", mr: 0.5, verticalAlign: "text-bottom", color: "#aa8947" }}
            />
            AI suggests <strong>{CATEGORY_LABELS[aiState.suggestion.category]}</strong>
          </p>

          {!showOverride ? (
            <div className="ai-suggestion-actions">
              <Button
                variant="contained"
                size="small"
                onClick={() => onAcceptSuggestion(aiState.suggestion.category)}
                className="accept-suggestion-button"
              >
                Accept suggestion
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setOverrideCategory(thought.category);
                  setShowOverride(true);
                }}
                className="override-suggestion-button"
              >
                Choose another
              </Button>
            </div>
          ) : (
            <Box className="override-controls">
              <CategorySelect
                id={`override-category-${thought.id}`}
                label="Your category"
                value={overrideCategory}
                onChange={setOverrideCategory}
              />
              {overrideCategory === aiState.suggestion.category && (
                <p className="override-help">
                  Choose a category different from the AI suggestion.
                </p>
              )}
              <div className="override-actions">
                <Button variant="outlined" size="small" onClick={() => setShowOverride(false)}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={overrideCategory === aiState.suggestion.category}
                  onClick={() => onOverrideSuggestion(overrideCategory)}
                >
                  Use my choice
                </Button>
              </div>
            </Box>
          )}
        </div>
      )}
    </div>
  );
}
