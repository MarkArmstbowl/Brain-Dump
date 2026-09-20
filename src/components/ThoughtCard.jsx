import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { CATEGORY_LABELS } from "../constants";
import CategorySelect from "./CategorySelect";

export default function ThoughtCard({
  thought,
  isEditing,
  isDragging,
  isDropTarget,
  dragEnabled,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDrop,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  aiState,
  onRequestSuggestion,
  onAcceptSuggestion,
  onOverrideSuggestion
}) {
  const [draftText, setDraftText] = useState(thought.text);
  const [draftCategory, setDraftCategory] = useState(thought.category);
  const [validationMessage, setValidationMessage] = useState("");
  const [showOverride, setShowOverride] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState("unsorted");
  const inputId = `edit-thought-${thought.id}`;
  const categoryId = `edit-category-${thought.id}`;

  useEffect(() => {
    setShowOverride(false);
  }, [aiState?.suggestion?.category]);

  function handleSave(event) {
    event.preventDefault();
    const trimmedText = draftText.trim();
    if (!trimmedText) {
      setValidationMessage("Please write a thought first.");
      return;
    }
    onSave(thought.id, trimmedText, draftCategory);
  }

  if (isEditing) {
    return (
      <li className="thought-card thought-card-editing">
        <form onSubmit={handleSave}>
          <TextField
            id={inputId}
            label="Edit thought"
            multiline
            minRows={3}
            value={draftText}
            autoFocus
            onChange={(event) => {
              setDraftText(event.target.value);
              setValidationMessage("");
            }}
            error={Boolean(validationMessage)}
            helperText={validationMessage || " "}
          />

          <div className="edit-category-field">
            <CategorySelect
              id={categoryId}
              value={draftCategory}
              onChange={setDraftCategory}
              label="Category"
            />
          </div>

          <div className="thought-actions">
            <Button variant="outlined" size="small" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" size="small" type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`thought-card thought-card-${thought.category}${isDragging ? " is-dragging" : ""}${isDropTarget ? " is-card-drop-target" : ""}`}
      draggable={dragEnabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="thought-card-header">
        <span className={`category-badge category-${thought.category}`}>
          <span className="category-dot" aria-hidden="true" />
          {CATEGORY_LABELS[thought.category]}
        </span>
        {dragEnabled && (
          <DragIndicatorRoundedIcon
            className="drag-handle"
            aria-hidden="true"
            titleAccess="Drag to another category"
            fontSize="small"
          />
        )}
      </div>
      <p className="thought-text">{thought.text}</p>

      <div className="ai-category-tools">
        {!aiState?.suggestion && (
          <Button
            variant="outlined"
            size="small"
            startIcon={
              aiState?.loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <AutoAwesomeRoundedIcon fontSize="small" />
              )
            }
            disabled={aiState?.loading}
            onClick={onRequestSuggestion}
            className="ai-suggest-button"
          >
            {aiState?.loading ? "Thinking…" : "Suggest category"}
          </Button>
        )}

        {aiState?.error && (
          <p className="ai-error" role="alert">{aiState.error}</p>
        )}

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
                  <p className="override-help">Choose a category different from the AI suggestion.</p>
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

      <div className="thought-actions">
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditRoundedIcon fontSize="small" />}
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          variant="text"
          color="error"
          size="small"
          startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
          onClick={() => onDelete(thought.id)}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
