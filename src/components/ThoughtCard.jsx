import { useEffect, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS } from "../constants";
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
          <label htmlFor={inputId}>Edit thought</label>
          <textarea
            id={inputId}
            rows="3"
            value={draftText}
            autoFocus
            onChange={(event) => {
              setDraftText(event.target.value);
              setValidationMessage("");
            }}
            aria-describedby={validationMessage ? `${inputId}-validation` : undefined}
          />
          {validationMessage && (
            <p id={`${inputId}-validation`} className="validation-message" role="alert">
              {validationMessage}
            </p>
          )}

          <div className="edit-category-field">
            <label htmlFor={categoryId}>Category</label>
            <CategorySelect
              id={categoryId}
              value={draftCategory}
              onChange={setDraftCategory}
            />
          </div>

          <div className="thought-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="primary-button compact-button" type="submit">
              Save changes
            </button>
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
          <span className="drag-handle" aria-hidden="true" title="Drag to another category">
            ⠿
          </span>
        )}
      </div>
      <p className="thought-text">{thought.text}</p>

      <div className="ai-category-tools">
        {!aiState?.suggestion && (
          <button
            className="ai-suggest-button"
            type="button"
            disabled={aiState?.loading}
            onClick={onRequestSuggestion}
          >
            <span aria-hidden="true">✦</span>
            {aiState?.loading ? "Thinking…" : "Suggest category"}
          </button>
        )}

        {aiState?.error && (
          <p className="ai-error" role="alert">{aiState.error}</p>
        )}

        {aiState?.suggestion && (
          <div className="ai-suggestion" aria-label="AI category suggestion">
            <p className="ai-suggestion-label">
              <span aria-hidden="true">✦</span> AI suggests <strong>{CATEGORY_LABELS[aiState.suggestion.category]}</strong>
            </p>

            {!showOverride ? (
              <div className="ai-suggestion-actions">
                <button
                  className="accept-suggestion-button"
                  type="button"
                  onClick={() => onAcceptSuggestion(aiState.suggestion.category)}
                >
                  Accept suggestion
                </button>
                <button
                  className="override-suggestion-button"
                  type="button"
                  onClick={() => {
                    setOverrideCategory(thought.category);
                    setShowOverride(true);
                  }}
                >
                  Choose another
                </button>
              </div>
            ) : (
              <div className="override-controls">
                <label htmlFor={`override-category-${thought.id}`}>Your category</label>
                <select
                  id={`override-category-${thought.id}`}
                  className="category-select"
                  value={overrideCategory}
                  onChange={(event) => setOverrideCategory(event.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                {overrideCategory === aiState.suggestion.category && (
                  <p className="override-help">Choose a category different from the AI suggestion.</p>
                )}
                <div className="override-actions">
                  <button className="secondary-button" type="button" onClick={() => setShowOverride(false)}>
                    Back
                  </button>
                  <button
                    className="primary-button compact-button"
                    type="button"
                    disabled={overrideCategory === aiState.suggestion.category}
                    onClick={() => onOverrideSuggestion(overrideCategory)}
                  >
                    Use my choice
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="thought-actions">
        <button className="secondary-button" type="button" onClick={onEdit}>
          Edit
        </button>
        <button className="delete-button" type="button" onClick={() => onDelete(thought.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}
