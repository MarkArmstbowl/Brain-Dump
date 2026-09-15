import { useRef, useState } from "react";
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
        <div className="draft-list">
          {drafts.map((draft, index) => {
            const inputId = `thought-input-${draft.id}`;
            const categoryId = `thought-category-${draft.id}`;
            const errorId = `${inputId}-validation`;

            return (
              <div className="draft-row" key={draft.id}>
                <span className="draft-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="draft-text-field">
                  <label className="sr-only" htmlFor={inputId}>
                    Thought {index + 1}
                  </label>
                  <textarea
                    ref={(element) => {
                      inputRefs.current[draft.id] = element;
                    }}
                    id={inputId}
                    className="draft-textarea"
                    rows="2"
                    value={draft.text}
                    onChange={(event) =>
                      updateDraft(draft.id, { text: event.target.value })
                    }
                    placeholder={index === 0 ? "Start anywhere. It doesn't have to be perfectly worded." : "Another thought..."}
                    aria-describedby={validationErrors[draft.id] ? errorId : undefined}
                  />
                  {validationErrors[draft.id] && (
                    <p id={errorId} className="validation-message" role="alert">
                      {validationErrors[draft.id]}
                    </p>
                  )}
                </div>
                <div className="draft-category-field">
                  <label htmlFor={categoryId}>Category</label>
                  <CategorySelect
                    id={categoryId}
                    value={draft.category}
                    onChange={(category) => updateDraft(draft.id, { category })}
                  />
                </div>
                {drafts.length > 1 && (
                  <button
                    className="remove-draft-button"
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    aria-label={`Remove thought ${index + 1}`}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="composer-footer">
          <button className="add-draft-button" type="button" onClick={addDraft}>
            <span aria-hidden="true">＋</span> Add another thought
          </button>
          <button className="primary-button submit-thoughts-button" type="submit">
            Add {drafts.length > 1 ? `${drafts.length} Thoughts` : "Thought"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </section>
  );
}
