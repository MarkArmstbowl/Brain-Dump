import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CategorySelect from "./CategorySelect";

export default function ThoughtEditForm({ thought, onCancel, onSave }) {
  const [draftText, setDraftText] = useState(thought.text);
  const [draftCategory, setDraftCategory] = useState(thought.category);
  const [validationMessage, setValidationMessage] = useState("");

  function handleSave(event) {
    event.preventDefault();
    const trimmedText = draftText.trim();
    if (!trimmedText) {
      setValidationMessage("Please write a thought first.");
      return;
    }
    onSave(thought.id, trimmedText, draftCategory);
  }

  return (
    <li className="thought-card thought-card-editing">
      <form onSubmit={handleSave}>
        <TextField
          id={`edit-thought-${thought.id}`}
          label="Edit thought"
          multiline
          minRows={3}
          value={draftText}
          autoFocus
          onChange={(event) => {
            setDraftText(event.target.value);
            setValidationMessage("");
          }}
          error={Boolean(validationMessage)}
          helperText={validationMessage || " "}
        />

        <div className="edit-category-field">
          <CategorySelect
            id={`edit-category-${thought.id}`}
            value={draftCategory}
            onChange={setDraftCategory}
            label="Category"
          />
        </div>

        <div className="thought-actions">
          <Button variant="outlined" size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" size="small" type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </li>
  );
}
