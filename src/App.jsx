import { useMemo, useState } from "react";
import { CATEGORY_LABELS } from "./constants";
import ThoughtComposer from "./components/ThoughtComposer";
import ThoughtFilters from "./components/ThoughtFilters";
import ThoughtList from "./components/ThoughtList";
import { loadThoughts, saveThoughts } from "./storage/thoughtStorage";

export default function App() {
  const [initialData] = useState(loadThoughts);
  const [thoughts, setThoughts] = useState(initialData.thoughts);
  const [storageError, setStorageError] = useState(initialData.error);
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [announcement, setAnnouncement] = useState("");

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
    commitThoughts(nextThoughts, "Thought deleted.");
  }

  function handleMoveThought(id, category) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || thought.category === category) return;

    const nextThoughts = thoughts.map((item) =>
      item.id === id ? { ...item, category } : item
    );
    commitThoughts(
      nextThoughts,
      `Thought moved to ${CATEGORY_LABELS[category]}.`
    );
  }

  function handleFilterChange(value, label) {
    setActiveFilter(value);
    setEditingId(null);
    setAnnouncement(`Showing ${label} thoughts.`);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">A QUIET PLACE FOR BUSY MINDS</p>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">b.</span>
          <h1>Brain Dump</h1>
        </div>
        <p className="subtitle">Clear your mind, one thought at a time.</p>
        <span className="header-flourish" aria-hidden="true"><i />✦<i /></span>
      </header>

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

      <div className="workspace">
        <aside className="capture-column" aria-label="Capture a thought">
          <ThoughtComposer onAddThoughts={handleAddThoughts} />
          {storageError && <p className="error-message" role="alert">{storageError}</p>}
          <p className="privacy-note">
            <span aria-hidden="true">●</span>
            Your thoughts stay in this browser.
          </p>
        </aside>

        <section className="dump-section" aria-labelledby="dump-heading">
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
            onMove={handleMoveThought}
          />
        </section>
      </div>

      <footer>A little room for what matters.</footer>
    </main>
  );
}
