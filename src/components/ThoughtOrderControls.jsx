import IconButton from "@mui/material/IconButton";

export default function ThoughtOrderControls({
  thoughtText,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown
}) {
  return (
    <div className="thought-order-controls" role="group" aria-label={`Reorder ${thoughtText}`}>
      <IconButton
        size="small"
        aria-label={`Move ${thoughtText} up`}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        <span aria-hidden="true">↑</span>
      </IconButton>
      <IconButton
        size="small"
        aria-label={`Move ${thoughtText} down`}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        <span aria-hidden="true">↓</span>
      </IconButton>
    </div>
  );
}
