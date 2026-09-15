import ThoughtCard from "./ThoughtCard";

export default function ThoughtList({
  thoughts,
  hasAnyThoughts,
  editingId,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete
}) {
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

  return (
    <ul className="thought-list" aria-label="Your thoughts">
      {thoughts.map((thought) => (
        <ThoughtCard
          key={`${thought.id}-${editingId === thought.id ? "edit" : "view"}`}
          thought={thought}
          isEditing={editingId === thought.id}
          onEdit={() => onEdit(thought.id)}
          onCancel={onCancelEdit}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
