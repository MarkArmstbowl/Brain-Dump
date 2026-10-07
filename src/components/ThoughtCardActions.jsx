import Button from "@mui/material/Button";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";

export default function ThoughtCardActions({
  onSaveForLater,
  onEdit,
  onDelete
}) {
  return (
    <div className="thought-actions">
      <Button
        variant="text"
        size="small"
        startIcon={<BookmarkAddOutlinedIcon fontSize="small" />}
        aria-label="Save for later"
        onClick={onSaveForLater}
      >
        Later
      </Button>
      <Button
        variant="text"
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
