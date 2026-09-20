import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentPasteGoRoundedIcon from "@mui/icons-material/ContentPasteGoRounded";
import CategorySelect from "./CategorySelect";

function createDraft() {
  return {
    id: crypto.randomUUID(),
    text: "",
    category: "unsorted"
  };
}

export default function ThoughtComposer({ onAddThoughts }) {
  const [drafts, setDrafts] = useState(() => [createDraft()]);
  const [validationErrors, setValidationErrors] = useState({});
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [pasteError, setPasteError] = useState("");
  const inputRefs = useRef([]);

  function updateDraft(id, changes) {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === id ? { ...draft, ...changes } : draft
      )
    );
    setValidationErrors((currentErrors) => {
      if (!currentErrors[id]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[id];
      return nextErrors;
    });
  }

  function addDraft() {
    const nextDraft = createDraft();
    setDrafts((currentDrafts) => [...currentDrafts, nextDraft]);
    requestAnimationFrame(() => {
      inputRefs.current[nextDraft.id]?.focus();
    });
  }

  function removeDraft(id) {
    setDrafts((currentDrafts) =>
      currentDrafts.filter((draft) => draft.id !== id)
    );
    setValidationErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[id];
      return nextErrors;
    });
  }

  function splitPastedThoughts() {
    const lines = pastedText
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, "").trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setPasteError("Paste at least two non-empty lines, with one thought on each line.");
      return;
    }

    const pastedDrafts = lines.map((text) => ({ ...createDraft(), text }));
    const hasWrittenDraft = drafts.some((draft) => draft.text.trim());
    setDrafts(hasWrittenDraft ? [...drafts, ...pastedDrafts] : pastedDrafts);
    setPastedText("");
    setPasteError("");
    setPasteOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    drafts.forEach((draft) => {
      if (!draft.text.trim()) {
        nextErrors[draft.id] = "Please write a thought or remove this row.";
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      const firstInvalidId = drafts.find((draft) => nextErrors[draft.id])?.id;
      inputRefs.current[firstInvalidId]?.focus();
      return;
    }

    onAddThoughts(
      drafts.map((draft) => ({ ...draft, text: draft.text.trim() }))
    );
    const emptyDraft = createDraft();
    setDrafts([emptyDraft]);
    setValidationErrors({});
    requestAnimationFrame(() => {
      inputRefs.current[emptyDraft.id]?.focus();
    });
  }

  return (
    <section className="composer" aria-labelledby="composer-heading">
      <div className="composer-heading">
        <div>
          <p className="section-kicker">QUICK CAPTURE</p>
          <h2 id="composer-heading">What's on your mind?</h2>
        </div>
        <p>Each thought can go somewhere different.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="capture-tools">
          <Button
            variant="outlined"
            size="small"
            aria-expanded={pasteOpen}
            startIcon={<ContentPasteGoRoundedIcon fontSize="small" />}
            onClick={() => {
              setPasteOpen((isOpen) => !isOpen);
              setPasteError("");
            }}
          >
            Paste multiple thoughts
          </Button>
          <p>One thought per line. Review them before adding.</p>
        </div>

        {pasteOpen && (
          <div className="paste-panel">
            <TextField
              id="paste-thoughts"
              label="Paste your list"
              multiline
              minRows={5}
              autoFocus
              value={pastedText}
              placeholder={"Finish the Agile assignment\nEmail the professor\nBook a dentist appointment"}
              onChange={(event) => {
                setPastedText(event.target.value);
                setPasteError("");
              }}
              error={Boolean(pasteError)}
              helperText={
                pasteError ||
                "Bullets and numbered-list prefixes are removed automatically."
              }
            />
            <div className="paste-actions">
              <Button variant="outlined" size="small" onClick={() => setPasteOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" size="small" onClick={splitPastedThoughts}>
                Split into thoughts
              </Button>
            </div>
          </div>
        )}

        <div className="draft-list">
          {drafts.map((draft, index) => {
            const inputId = `thought-input-${draft.id}`;
            const categoryId = `thought-category-${draft.id}`;
            const draftError = validationErrors[draft.id];

            return (
              <div className="draft-row" key={draft.id}>
                <span className="draft-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="draft-text-field">
                  <TextField
                    id={inputId}
                    label={`Thought ${index + 1}`}
                    multiline
                    minRows={2}
                    value={draft.text}
                    onChange={(event) =>
                      updateDraft(draft.id, { text: event.target.value })
                    }
                    placeholder={index === 0 ? "Start anywhere. It doesn't have to be perfectly worded." : "Another thought..."}
                    error={Boolean(draftError)}
                    helperText={draftError || " "}
                    inputRef={(element) => {
                      inputRefs.current[draft.id] = element;
                    }}
                  />
                </div>
                <div className="draft-category-field">
                  <CategorySelect
                    id={categoryId}
                    value={draft.category}
                    onChange={(category) => updateDraft(draft.id, { category })}
                    label="Category"
                  />
                </div>
                {drafts.length > 1 && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => removeDraft(draft.id)}
                    aria-label={`Remove thought ${index + 1}`}
                    sx={{ mt: "28px" }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            );
          })}
        </div>

        <div className="composer-footer">
          <Button
            variant="text"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={addDraft}
          >
            Add another thought
          </Button>
          <Button
            variant="contained"
            size="medium"
            type="submit"
            endIcon={<ArrowForwardRoundedIcon />}
            className="submit-thoughts-button"
          >
            Add {drafts.length > 1 ? `${drafts.length} Thoughts` : "Thought"}
          </Button>
        </div>
      </form>
    </section>
  );
}
