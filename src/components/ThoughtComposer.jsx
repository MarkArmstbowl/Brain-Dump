import { useRef, useState } from "react";
import CategorySelect from "./CategorySelect";

export default function ThoughtComposer({ onAddThought }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("unsorted");
  const [validationMessage, setValidationMessage] = useState("");
  const inputRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      setValidationMessage("Please write a thought first.");
      inputRef.current?.focus();
      return;
    }

    onAddThought(trimmedText, category);
    setText("");
    setCategory("unsorted");
    setValidationMessage("");
    inputRef.current?.focus();
  }

  return (
    <section className="composer" aria-label="Add a thought">
      <form onSubmit={handleSubmit}>
        <label id="thought-label" htmlFor="thought-input">
          What's on your mind?
        </label>
        <textarea
          ref={inputRef}
          id="thought-input"
          name="thought"
          rows="4"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setValidationMessage("");
          }}
          placeholder="Start anywhere. It doesn't have to be perfectly worded."
          aria-describedby={validationMessage ? "thought-validation" : undefined}
        />
        {validationMessage && (
          <p id="thought-validation" className="validation-message" role="alert">
            {validationMessage}
          </p>
        )}

        <div className="category-field">
          <div>
            <label htmlFor="category-input">Where does it belong?</label>
            <p>You can always change this later.</p>
          </div>
          <CategorySelect
            id="category-input"
            value={category}
            onChange={setCategory}
          />
        </div>

        <div className="composer-footer">
          <p>One thought is a good place to start.</p>
          <button className="primary-button" type="submit">
            Add Thought <span aria-hidden="true">＋</span>
          </button>
        </div>
      </form>
    </section>
  );
}
