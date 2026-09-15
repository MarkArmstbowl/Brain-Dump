import { useState } from "react";
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
  onMove
}) {
  const [draggedThoughtId, setDraggedThoughtId] = useState(null);
  const [dropTargetCategory, setDropTargetCategory] = useState(null);

  if (thoughts.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">✳</span>
        <h3>{hasAnyThoughts ? "Nothing in this category yet." : "A little more room to think."}</h3>
        <p>
          {hasAnyThoughts
            ? "Choose another filter or add a new thought."
            : "No thoughts here yet. Add your first one above."}
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
  }

  function dropThought(event, category) {
    event.preventDefault();
    const thoughtId = event.dataTransfer.getData("text/plain") || draggedThoughtId;
    if (thoughtId) onMove(thoughtId, category);
    finishDragging();
  }

  function renderThoughtCards(categoryThoughts, dragEnabled = false) {
    return categoryThoughts.map((thought) => (
      <ThoughtCard
        key={`${thought.id}-${editingId === thought.id ? "edit" : "view"}`}
        thought={thought}
        isEditing={editingId === thought.id}
        isDragging={draggedThoughtId === thought.id}
        dragEnabled={dragEnabled && editingId !== thought.id}
        onDragStart={(event) => startDragging(event, thought.id)}
        onDragEnd={finishDragging}
        onEdit={() => onEdit(thought.id)}
        onCancel={onCancelEdit}
        onSave={onSave}
        onDelete={onDelete}
      />
    ));
  }

  if (grouped) {
    return (
      <>
        <p className="drag-instruction">
          <span aria-hidden="true">⠿</span>
          <span className="desktop-drag-copy">Drag a card into another column to move it.</span>
          <span className="mobile-drag-copy">Swipe to see each category. Use Edit to move a card.</span>
        </p>
        <div className="category-groups" aria-label="Thoughts grouped by category">
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
                onDragEnter={() => setDropTargetCategory(category.value)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropThought(event, category.value)}
              >
                <header className="category-group-heading">
                  <span className={`category-group-dot category-group-dot-${category.value}`} aria-hidden="true" />
                  <h3 id={headingId}>{category.label}</h3>
                </header>
                {categoryThoughts.length > 0 ? (
                  <ul className="thought-list group-thought-list">
                    {renderThoughtCards(categoryThoughts, true)}
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
      {renderThoughtCards(thoughts)}
    </ul>
  );
}
