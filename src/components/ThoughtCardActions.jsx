import Button from "@mui/material/Button";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

export default function ThoughtCardActions({
  isDo,
  isPriority,
  onTogglePriority,
  onEdit,
  onDelete
}) {
  return (
    <div className="thought-actions">
      {isDo && (
        <Button
          variant={isPriority ? "contained" : "outlined"}
          color="warning"
          size="small"
          startIcon={
            isPriority
              ? <StarRoundedIcon fontSize="small" />
              : <StarBorderRoundedIcon fontSize="small" />
          }
          onClick={onTogglePriority}
          className="priority-action"
        >
          {isPriority ? "Remove priority" : "Mark priority"}
        </Button>
      )}
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
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}
