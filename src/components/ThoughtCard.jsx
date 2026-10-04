import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { CATEGORY_LABELS, getPriority, PRIORITY_LEVELS } from "../constants";
import CategorySuggestion from "./CategorySuggestion";
import ThoughtLifecycleTools from "./ThoughtLifecycleTools";
import ThoughtTimestamps from "./ThoughtTimestamps";
import ThoughtCardActions from "./ThoughtCardActions";
import ThoughtEditForm from "./ThoughtEditForm";
import ThoughtFocusTools from "./ThoughtFocusTools";
import ThoughtOrderControls from "./ThoughtOrderControls";

export default function ThoughtCard({
  thought,
  isEditing,
  isDragging,
  isDropTarget,
  dragEnabled,
  showReorderControls,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDrop,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onTogglePriority,
  onSetPriority,
  onComplete,
  onRecordDecision,
  onResolve,
  onDismiss,
  onSelectNext,
  planningAiState,
  onRequestFirstStep,
  onApplyFirstStep,
  onDismissPlanningSuggestion,
  aiState,
  onRequestSuggestion,
  onAcceptSuggestion,
  onOverrideSuggestion
}) {
  if (isEditing) {
    return (
      <ThoughtEditForm
        thought={thought}
        onCancel={onCancel}
        onSave={onSave}
      />
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
        <div className="thought-labels">
          <span className={`category-badge category-${thought.category}`}>
            <span className="category-dot" aria-hidden="true" />
            {CATEGORY_LABELS[thought.category]}
          </span>
          {thought.isPriority && (
            <span className="priority-badge">
              <StarRoundedIcon aria-hidden="true" fontSize="inherit" />
              Priority
              <small> ({getPriority(thought)})</small>
            </span>
          )}
          {thought.isNext && (
            <span className="next-badge">
              <span aria-hidden="true">→</span>
              Next
            </span>
          )}
        </div>

        <div className="thought-card-order-tools">
          {showReorderControls && (
            <ThoughtOrderControls
              thoughtText={thought.text}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          )}
          {dragEnabled && (
            <DragIndicatorRoundedIcon
              className="drag-handle"
              aria-hidden="true"
              titleAccess="Drag to another category"
              fontSize="small"
            />
          )}
        </div>
      </div>

      <p className="thought-text">{thought.text}</p>
      <ThoughtTimestamps thought={thought} />

      <details className="thought-action-drawer">
        <summary>
          <span>Actions</span>
          <span className="thought-action-hint">
            {thought.category === "do" ? "Focus, organize & manage" : "Organize & manage"}
          </span>
        </summary>
        <div className="thought-action-content">
          {thought.category === "do" && (
            <div className="thought-action-section">
              <p className="thought-action-section-label">Focus</p>
              <ThoughtFocusTools
                thought={thought}
                planningAiState={planningAiState}
                onSelectNext={onSelectNext}
                onRequestFirstStep={onRequestFirstStep}
                onApplyFirstStep={onApplyFirstStep}
                onDismissPlanningSuggestion={onDismissPlanningSuggestion}
              />
            </div>
          )}

          <div className="thought-action-section">
            <p className="thought-action-section-label">Organize</p>
            <CategorySuggestion
              thought={thought}
              aiState={aiState}
              onRequestSuggestion={onRequestSuggestion}
              onAcceptSuggestion={onAcceptSuggestion}
              onOverrideSuggestion={onOverrideSuggestion}
            />
          </div>

          <div className="thought-action-section">
            <p className="thought-action-section-label">Manage</p>
            <ThoughtLifecycleTools thought={thought} onComplete={onComplete} onRecordDecision={onRecordDecision} onResolve={onResolve} onDismiss={onDismiss} />
            {thought.category === "do" && <label>Priority level
              <select aria-label={`Priority level for ${thought.text}`} value={getPriority(thought)} onChange={(event) => onSetPriority(thought.id, event.target.value)}>
                {PRIORITY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>}
            <ThoughtCardActions
              isDo={thought.category === "do"}
              isPriority={thought.isPriority}
              onTogglePriority={onTogglePriority}
              onEdit={onEdit}
              onDelete={() => onDelete(thought.id)}
            />
          </div>
        </div>
      </details>
    </li>
  );
}
