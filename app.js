const STORAGE_KEY = "brain-dump-thoughts";
const thoughtForm = document.querySelector("#thought-form");
const thoughtInput = document.querySelector("#thought-input");
const thoughtList = document.querySelector("#thought-list");
const emptyState = document.querySelector("#empty-state");
const thoughtCount = document.querySelector("#thought-count");
const storageError = document.querySelector("#storage-error");
const status = document.querySelector("#status");

let thoughts = loadThoughts();
let editingId = null;
let editDraft = "";

function showStorageError(message) {
  storageError.textContent = message;
  storageError.hidden = false;
}

function loadThoughts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(thought =>
      thought && typeof thought.id === "string" &&
      typeof thought.text === "string" && thought.text.trim()
    ) || new Set(parsed.map(thought => thought.id)).size !== parsed.length) {
      throw new Error("Invalid saved thoughts");
    }
    return parsed;
  } catch {
    showStorageError("Your saved thoughts couldn't be loaded. You can still capture thoughts here, but your next successful change will replace the saved list.");
    return [];
  }
}

function saveThoughts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
    storageError.hidden = true;
  } catch {
    showStorageError("Your changes are visible, but couldn't be saved in this browser. Keep this page open to avoid losing them.");
  }
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function validateText(input) {
  input.setCustomValidity(input.value.trim() ? "" : "Please write a thought first.");
  return input.reportValidity();
}

function renderThoughts() {
  thoughtList.replaceChildren();
  emptyState.hidden = thoughts.length > 0;
  thoughtCount.textContent = `${thoughts.length} ${thoughts.length === 1 ? "thought" : "thoughts"}`;

  thoughts.forEach((thought, index) => {
    const card = document.createElement("li");
    card.className = "thought-card";
    const actions = document.createElement("div");
    actions.className = "thought-actions";

    if (editingId === thought.id) {
      const editForm = document.createElement("form");
      const label = document.createElement("label");
      label.htmlFor = "edit-input";
      label.textContent = "Edit thought";
      const editInput = document.createElement("textarea");
      editInput.id = "edit-input";
      editInput.value = editDraft;
      editInput.required = true;
      editInput.rows = 3;
      editInput.addEventListener("input", () => {
        editInput.setCustomValidity("");
        editDraft = editInput.value;
      });

      const cancelButton = makeButton("Cancel", "secondary-button", () => {
        editingId = null;
        renderThoughts();
        focusEditButton(index);
      });
      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.className = "primary-button";
      saveButton.textContent = "Save";
      actions.append(cancelButton, saveButton);
      editForm.append(label, editInput, actions);
      editForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!validateText(editInput)) return;
        thought.text = editInput.value.trim();
        editingId = null;
        saveThoughts();
        renderThoughts();
        focusEditButton(index);
        status.textContent = "Thought updated.";
      });
      card.append(editForm);
    } else {
      const text = document.createElement("p");
      text.className = "thought-text";
      // Treat thoughts as plain text, never as HTML.
      text.textContent = thought.text;
      const editButton = makeButton("Edit", "secondary-button edit-button", () => {
        editingId = thought.id;
        editDraft = thought.text;
        renderThoughts();
        const editInput = document.querySelector("#edit-input");
        editInput.focus();
        editInput.setSelectionRange(editInput.value.length, editInput.value.length);
      });
      const deleteButton = makeButton("Delete", "delete-button", () => {
        thoughts = thoughts.filter(item => item.id !== thought.id);
        saveThoughts();
        renderThoughts();
        const nextButton = thoughtList.children[Math.min(index, thoughts.length - 1)]?.querySelector("button");
        (nextButton || thoughtInput).focus();
        status.textContent = "Thought deleted.";
      });
      actions.append(editButton, deleteButton);
      card.append(text, actions);
    }
    thoughtList.append(card);
  });
}

function focusEditButton(index) {
  thoughtList.children[index]?.querySelector(".edit-button")?.focus();
}

thoughtInput.addEventListener("input", () => thoughtInput.setCustomValidity(""));
thoughtForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateText(thoughtInput)) return;
  thoughts.push({ id: crypto.randomUUID(), text: thoughtInput.value.trim() });
  saveThoughts();
  renderThoughts();
  thoughtForm.reset();
  thoughtInput.focus();
  status.textContent = "Thought added.";
});

renderThoughts();
