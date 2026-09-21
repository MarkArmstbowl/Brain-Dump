import { useState } from "react";
import Button from "@mui/material/Button";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import { CATEGORIES } from "../constants";
import ThoughtCard from "./ThoughtCard";

const GROUPED_CATEGORIES = [...CATEGORIES.slice(1), CATEGORIES[0]];

export default function ThoughtList({
  thoughts,
  hasAnyThoughts,
  grouped,
  editingId,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onReorder,
  onTogglePriority,
  onSelectNext,
  planningAiState,
  onRequestFirstStep,
  onApplyFirstStep,
  onDismissPlanningSuggestion,
  aiStates,
  onRequestSuggestion,
  onAcceptSuggestion,
  onOverrideSuggestion
}) {
  const [draggedThoughtId, setDraggedThoughtId] = useState(null);
  const [dropTargetCategory, setDropTargetCategory] = useState(null);
  const [dropTargetThoughtId, setDropTargetThoughtId] = useState(null);
  const [isDoFocused, setIsDoFocused] = useState(false);

  if (thoughts.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">✳</span>
        <h3>{hasAnyThoughts ? "Nothing in this category yet." : "A little more room to think."}</h3>
        <p>
          {hasAnyThoughts
            ? "Choose another filter or add a new thought."
            : "No thoughts here yet. Capture your first one in the Capture tab."}
        </p>
      </div>
    );
  }

  function startDragging(event, thoughtId) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", thoughtId);
    setDraggedThoughtId(thoughtId);
  }

  function finishDragging() {
    setDraggedThoughtId(null);
    setDropTargetCategory(null);
    setDropTargetThoughtId(null);
  }

  function dropAtEnd(event, category) {
    event.preventDefault();
    const thoughtId = event.dataTransfer.getData("text/plain") || draggedThoughtId;
    if (thoughtId) onReorder(thoughtId, category);
    finishDragging();
  }

  function dropBeforeThought(event, category, beforeId) {
    event.preventDefault();
    event.stopPropagation();
    const thoughtId = event.dataTransfer.getData("text/plain") || draggedThoughtId;
    if (thoughtId) onReorder(thoughtId, category, beforeId);
    finishDragging();
  }

  function renderThoughtCards(
    categoryThoughts,
    dragEnabled = false,
    category = null,
    showReorderControls = dragEnabled
  ) {
    return categoryThoughts.map((thought, index) => (
      <ThoughtCard
        key={`${thought.id}-${editingId === thought.id ? "edit" : "view"}`}
        thought={thought}
        isEditing={editingId === thought.id}
        isDragging={draggedThoughtId === thought.id}
        isDropTarget={dropTargetThoughtId === thought.id}
        dragEnabled={dragEnabled && editingId !== thought.id}
        showReorderControls={showReorderControls}
        canMoveUp={index > 0}
        canMoveDown={index < categoryThoughts.length - 1}
        onMoveUp={() => onReorder(
          thought.id,
          category,
          categoryThoughts[index - 1]?.id
        )}
        onMoveDown={() => onReorder(
          thought.id,
          category,
          categoryThoughts[index + 2]?.id || null
        )}
        onDragStart={(event) => startDragging(event, thought.id)}
        onDragEnd={finishDragging}
        onDragEnter={() => {
          if (draggedThoughtId !== thought.id) {
            setDropTargetCategory(category);
            setDropTargetThoughtId(thought.id);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => dropBeforeThought(event, category, thought.id)}
        onEdit={() => onEdit(thought.id)}
        onCancel={onCancelEdit}
        onSave={onSave}
        onDelete={onDelete}
        onTogglePriority={() => onTogglePriority(thought.id)}
        onSelectNext={() => onSelectNext(thought.id)}
        planningAiState={planningAiState}
        onRequestFirstStep={() => onRequestFirstStep(thought.id)}
        onApplyFirstStep={(step) => onApplyFirstStep(thought.id, step)}
        onDismissPlanningSuggestion={onDismissPlanningSuggestion}
        aiState={aiStates[thought.id]}
        onRequestSuggestion={() => onRequestSuggestion(thought.id)}
        onAcceptSuggestion={(suggestedCategory) => onAcceptSuggestion(thought.id, suggestedCategory)}
        onOverrideSuggestion={(chosenCategory) => onOverrideSuggestion(thought.id, chosenCategory)}
      />
    ));
  }

  if (grouped) {
    return (
      <>
        <div className="board-toolbar">
          <p className="drag-instruction">
            <span aria-hidden="true">⠿</span>
            <span className="desktop-drag-copy">Drag cards or use their arrow buttons to reorder. Drag into another column to move categories.</span>
            <span className="mobile-drag-copy">Use arrow buttons to reorder. Use Edit to move categories.</span>
          </p>
          <Button
            className="do-focus-toggle"
            variant="outlined"
            size="small"
            startIcon={isDoFocused
              ? <CloseFullscreenRoundedIcon fontSize="small" />
              : <OpenInFullRoundedIcon fontSize="small" />}
            aria-pressed={isDoFocused}
            onClick={() => setIsDoFocused((focused) => !focused)}
          >
            {isDoFocused ? "Balance columns" : "Focus Do"}
          </Button>
        </div>
        <div
          className={`category-groups${isDoFocused ? " is-do-focused" : ""}`}
          aria-label="Thoughts grouped by category"
        >
          {GROUPED_CATEGORIES.map((category) => {
            const categoryThoughts = thoughts.filter(
              (thought) => thought.category === category.value
            );
            const headingId = `group-heading-${category.value}`;
            const isDropTarget = dropTargetCategory === category.value;

            return (
              <section
                key={category.value}
                className={`category-group category-group-${category.value}${isDropTarget ? " is-drop-target" : ""}`}
                aria-labelledby={headingId}
                onDragEnter={(event) => {
                  if (event.target === event.currentTarget) {
                    setDropTargetCategory(category.value);
                    setDropTargetThoughtId(null);
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropAtEnd(event, category.value)}
              >
                <header className="category-group-heading">
                  <span className={`category-group-dot category-group-dot-${category.value}`} aria-hidden="true" />
                  <h3 id={headingId}>{category.label}</h3>
                </header>
                {categoryThoughts.length > 0 ? (
                  <ul className="thought-list group-thought-list">
                    {renderThoughtCards(categoryThoughts, true, category.value)}
                  </ul>
                ) : (
                  <p className="category-group-empty">
                    {draggedThoughtId ? "Drop it here" : "Nothing here yet."}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <ul className="thought-list filtered-thought-list" aria-label="Your thoughts">
      {renderThoughtCards(thoughts, false, thoughts[0]?.category, true)}
    </ul>
  );
}
