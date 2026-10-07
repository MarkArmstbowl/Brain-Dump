import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { CATEGORY_LABELS } from "../constants";
import CategorySuggestion from "./CategorySuggestion";
import ThoughtCardActions from "./ThoughtCardActions";
import ThoughtEditForm from "./ThoughtEditForm";
import ThoughtFocusTools from "./ThoughtFocusTools";
import ThoughtOrderControls from "./ThoughtOrderControls";
import ThoughtOutcomeTools from "./ThoughtOutcomeTools";

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
  onSelectNext,
  onRecordDecision,
  onResolveDecision,
  onDismissThought,
  onSaveForLater,
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

      <details className="thought-action-drawer">
        <summary>
          <span>Actions</span>
        </summary>
        <div className="thought-action-content">
          {thought.category === "do" && (
            <div className="thought-action-section">
              <div className="thought-action-section-heading">
                <p className="thought-action-section-label">Plan</p>
                <span>Priority or Next</span>
              </div>
              <ThoughtFocusTools
                thought={thought}
                planningAiState={planningAiState}
                onSelectNext={onSelectNext}
                onTogglePriority={onTogglePriority}
                onRequestFirstStep={onRequestFirstStep}
                onApplyFirstStep={onApplyFirstStep}
                onDismissPlanningSuggestion={onDismissPlanningSuggestion}
              />
            </div>
          )}

          {(thought.category === "decide" || thought.category === "let-go") && (
            <div className="thought-action-section thought-outcome-section">
              <div className="thought-action-section-heading">
                <p className="thought-action-section-label">
                  {thought.category === "decide" ? "Decision" : "Let go"}
                </p>
                <span>
                  {thought.category === "decide" ? "Record, then resolve" : "Clear from active view"}
                </span>
              </div>
              <ThoughtOutcomeTools
                thought={thought}
                onRecordDecision={onRecordDecision}
                onResolveDecision={onResolveDecision}
                onDismissThought={onDismissThought}
              />
            </div>
          )}

          <div className="thought-action-section">
            <div className="thought-action-section-heading">
              <p className="thought-action-section-label">Category</p>
              <span>AI suggestion</span>
            </div>
            <CategorySuggestion
              thought={thought}
              aiState={aiState}
              onRequestSuggestion={onRequestSuggestion}
              onAcceptSuggestion={onAcceptSuggestion}
              onOverrideSuggestion={onOverrideSuggestion}
            />
          </div>

          <div className="thought-management-section">
            <ThoughtCardActions
              onSaveForLater={onSaveForLater}
              onEdit={onEdit}
              onDelete={() => onDelete(thought.id)}
            />
          </div>
        </div>
      </details>
    </li>
  );
}
