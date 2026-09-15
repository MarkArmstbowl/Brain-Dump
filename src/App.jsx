import { useMemo, useRef, useState } from "react";
import { CATEGORY_LABELS } from "./constants";
import { getCategorySuggestion } from "./api/categorySuggestion";
import ThoughtComposer from "./components/ThoughtComposer";
import ThoughtFilters from "./components/ThoughtFilters";
import ThoughtList from "./components/ThoughtList";
import { loadThoughts, saveThoughts } from "./storage/thoughtStorage";

export default function App() {
  const [initialData] = useState(loadThoughts);
  const [thoughts, setThoughts] = useState(initialData.thoughts);
  const [storageError, setStorageError] = useState(initialData.error);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState("capture");
  const [editingId, setEditingId] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [aiStates, setAiStates] = useState({});
  const aiRequestVersions = useRef({});

  const visibleThoughts = useMemo(
    () =>
      activeFilter === "all"
        ? thoughts
        : thoughts.filter((thought) => thought.category === activeFilter),
    [activeFilter, thoughts]
  );

  function commitThoughts(nextThoughts, message) {
    setThoughts(nextThoughts);
    setStorageError(saveThoughts(nextThoughts));
    setAnnouncement(message);
  }

  function handleAddThoughts(newThoughts) {
    const nextThoughts = [...thoughts, ...newThoughts];
    setActiveFilter("all");
    commitThoughts(
      nextThoughts,
      `${newThoughts.length} ${newThoughts.length === 1 ? "thought" : "thoughts"} added.`
    );
  }

  function handleSaveThought(id, text, category) {
    const nextThoughts = thoughts.map((thought) =>
      thought.id === id ? { ...thought, text, category } : thought
    );
    setEditingId(null);
    clearAiState(id);
    commitThoughts(
      nextThoughts,
      `Thought updated and assigned to ${CATEGORY_LABELS[category]}.`
    );
  }

  function handleDeleteThought(id) {
    const nextThoughts = thoughts.filter((thought) => thought.id !== id);
    if (editingId === id) {
      setEditingId(null);
    }
    clearAiState(id);
    commitThoughts(nextThoughts, "Thought deleted.");
  }

  function handleReorderThought(id, category, beforeId = null) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || beforeId === id) return;

    const remainingThoughts = thoughts.filter((item) => item.id !== id);
    const movedThought = { ...thought, category };
    let insertionIndex;

    if (beforeId) {
      insertionIndex = remainingThoughts.findIndex((item) => item.id === beforeId);
    } else {
      const lastCategoryIndex = remainingThoughts.reduce(
        (lastIndex, item, index) => item.category === category ? index : lastIndex,
        -1
      );
      insertionIndex = lastCategoryIndex === -1 ? remainingThoughts.length : lastCategoryIndex + 1;
    }

    if (insertionIndex < 0) return;

    const nextThoughts = [...remainingThoughts];
    nextThoughts.splice(insertionIndex, 0, movedThought);
    commitThoughts(
      nextThoughts,
      thought.category === category
        ? `Thought reordered in ${CATEGORY_LABELS[category]}.`
        : `Thought moved to ${CATEGORY_LABELS[category]}.`
    );
  }

  function clearAiState(id) {
    aiRequestVersions.current[id] = (aiRequestVersions.current[id] || 0) + 1;
    setAiStates((currentStates) => {
      if (!currentStates[id]) return currentStates;
      const nextStates = { ...currentStates };
      delete nextStates[id];
      return nextStates;
    });
  }

  async function handleRequestSuggestion(id) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought) return;
    const requestVersion = (aiRequestVersions.current[id] || 0) + 1;
    aiRequestVersions.current[id] = requestVersion;

    setAiStates((currentStates) => ({
      ...currentStates,
      [id]: { loading: true, suggestion: null, error: "" }
    }));

    try {
      const suggestion = await getCategorySuggestion(thought.text);
      if (aiRequestVersions.current[id] !== requestVersion) return;
      setAiStates((currentStates) => ({
        ...currentStates,
        [id]: { loading: false, suggestion, error: "" }
      }));
      setAnnouncement(`AI suggested ${CATEGORY_LABELS[suggestion.category]}.`);
    } catch (error) {
      if (aiRequestVersions.current[id] !== requestVersion) return;
      setAiStates((currentStates) => ({
        ...currentStates,
        [id]: { loading: false, suggestion: null, error: error.message }
      }));
      setAnnouncement("AI suggestion failed.");
    }
  }

  function applyAiChoice(id, category, action) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought) return;

    const nextThoughts = thoughts.map((item) =>
      item.id === id ? { ...item, category } : item
    );
    clearAiState(id);
    commitThoughts(
      nextThoughts,
      action === "accepted"
        ? `AI suggestion accepted. Thought assigned to ${CATEGORY_LABELS[category]}.`
        : `AI suggestion overridden. Thought assigned to ${CATEGORY_LABELS[category]}.`
    );
  }

  function handleFilterChange(value, label) {
    setActiveFilter(value);
    setEditingId(null);
    setAnnouncement(`Showing ${label} thoughts.`);
  }

  function switchView(view) {
    setActiveView(view);
    setEditingId(null);
    setAnnouncement(view === "capture" ? "Capture view opened." : "Organize view opened.");
  }

  function handleTabKeyDown(event, currentView) {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();
    const nextView = currentView === "capture" ? "organize" : "capture";
    switchView(nextView);
    requestAnimationFrame(() => document.getElementById(`${nextView}-tab`)?.focus());
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">b.</span>
          <div>
            <p className="eyebrow">A QUIET PLACE FOR BUSY MINDS</p>
            <h1>Brain Dump</h1>
          </div>
        </div>
        <div className="header-tagline">
          <p className="subtitle">Clear your mind, one thought at a time.</p>
          <span className="header-flourish" aria-hidden="true"><i />✦<i /></span>
        </div>
      </header>

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      {storageError && <p className="error-message" role="alert">{storageError}</p>}

      <nav className="view-navigation" aria-label="Brain Dump sections">
        <div className="view-tabs" role="tablist" aria-label="Capture and organize">
          <button
            id="capture-tab"
            className={`view-tab${activeView === "capture" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeView === "capture"}
            aria-controls="capture-panel"
            tabIndex={activeView === "capture" ? 0 : -1}
            onClick={() => switchView("capture")}
            onKeyDown={(event) => handleTabKeyDown(event, "capture")}
          >
            <span className="view-tab-number" aria-hidden="true">01</span>
            Capture
          </button>
          <button
            id="organize-tab"
            className={`view-tab${activeView === "organize" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeView === "organize"}
            aria-controls="organize-panel"
            tabIndex={activeView === "organize" ? 0 : -1}
            onClick={() => switchView("organize")}
            onKeyDown={(event) => handleTabKeyDown(event, "organize")}
          >
            <span className="view-tab-number" aria-hidden="true">02</span>
            Organize
            <span className="view-tab-count" aria-label={`${thoughts.length} thoughts`}>{thoughts.length}</span>
          </button>
        </div>
      </nav>

      <div className="workspace">
        <section
          id="capture-panel"
          className="capture-column workspace-view"
          role="tabpanel"
          aria-labelledby="capture-tab"
          hidden={activeView !== "capture"}
        >
          <div className="capture-stage">
            <span className="ambient-card ambient-card-left" aria-hidden="true" />
            <span className="ambient-card ambient-card-right" aria-hidden="true" />
            <span className="ambient-orbit ambient-orbit-left" aria-hidden="true" />
            <span className="ambient-orbit ambient-orbit-right" aria-hidden="true" />
            <span className="ambient-spark ambient-spark-one" aria-hidden="true">✦</span>
            <span className="ambient-spark ambient-spark-two" aria-hidden="true">✧</span>
            <ThoughtComposer onAddThoughts={handleAddThoughts} />
          </div>
          <div className="capture-aftercare">
            <p className="privacy-note">
              <span aria-hidden="true">●</span>
              Thoughts stay in this browser unless you request an AI suggestion.
            </p>
            {thoughts.length > 0 && (
              <button className="review-dump-button" type="button" onClick={() => switchView("organize")}>
                Organize {thoughts.length} {thoughts.length === 1 ? "thought" : "thoughts"}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </section>

        <section
          id="organize-panel"
          className="dump-section workspace-view"
          role="tabpanel"
          aria-labelledby="organize-tab"
          hidden={activeView !== "organize"}
        >
          <span className="organize-doodle organize-note-doodle" aria-hidden="true" />
          <span className="organize-doodle organize-ring-doodle" aria-hidden="true" />
          <span className="organize-doodle organize-spark-doodle" aria-hidden="true">✦</span>
          <span className="organize-doodle organize-dots-doodle" aria-hidden="true"><i /><i /><i /></span>
          <div className="section-heading">
            <div>
              <p className="section-kicker">CURRENT THOUGHTS</p>
              <h2 id="dump-heading">Your Brain Dump</h2>
            </div>
            <span className="thought-count">
              {thoughts.length} {thoughts.length === 1 ? "thought" : "thoughts"}
            </span>
          </div>

          <ThoughtFilters activeFilter={activeFilter} onChange={handleFilterChange} />
          <ThoughtList
            thoughts={visibleThoughts}
            hasAnyThoughts={thoughts.length > 0}
            grouped={activeFilter === "all"}
            editingId={editingId}
            onEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onSave={handleSaveThought}
            onDelete={handleDeleteThought}
            onReorder={handleReorderThought}
            aiStates={aiStates}
            onRequestSuggestion={handleRequestSuggestion}
            onAcceptSuggestion={(id, category) => applyAiChoice(id, category, "accepted")}
            onOverrideSuggestion={(id, category) => applyAiChoice(id, category, "overridden")}
          />
        </section>
      </div>

      <footer>A little room for what matters.</footer>
    </main>
  );
}
