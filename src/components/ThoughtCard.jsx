import { useState } from "react";
import { CATEGORY_LABELS } from "../constants";
import CategorySelect from "./CategorySelect";

export default function ThoughtCard({
  thought,
  isEditing,
  isDragging,
  dragEnabled,
  onDragStart,
  onDragEnd,
  onEdit,
  onCancel,
  onSave,
  onDelete
}) {
  const [draftText, setDraftText] = useState(thought.text);
  const [draftCategory, setDraftCategory] = useState(thought.category);
  const [validationMessage, setValidationMessage] = useState("");
  const inputId = `edit-thought-${thought.id}`;
  const categoryId = `edit-category-${thought.id}`;

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
      className={`thought-card thought-card-${thought.category}${isDragging ? " is-dragging" : ""}`}
      draggable={dragEnabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
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
