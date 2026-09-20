import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { CATEGORY_LABELS } from "./constants";
import { getCategorySuggestion } from "./api/categorySuggestion";
import {
  getFirstStepSuggestion,
  getNextSuggestion,
  getPrioritySuggestion
} from "./api/focusSuggestions";
import AiConsentDialog from "./components/AiConsentDialog";
import FocusTools from "./components/FocusTools";
import ThoughtComposer from "./components/ThoughtComposer";
import ThoughtFilters from "./components/ThoughtFilters";
import ThoughtList from "./components/ThoughtList";
import {
  loadAiConsent,
  loadPlanningAiConsent,
  saveAiConsent,
  savePlanningAiConsent
} from "./storage/aiConsentStorage";
import { loadThoughts, saveThoughts } from "./storage/thoughtStorage";
import { thoughtActions, thoughtReducer } from "./state/thoughtReducer";

const AI_REQUEST_TIMEOUT_MS = 15_000;

function TabNumberBadge({ children }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        font: "700 9px/1 Georgia, serif",
        letterSpacing: "0.08em",
        color: "inherit",
        opacity: 0.7,
        ".Mui-selected &": { opacity: 0.8 }
      }}
    >
      {children}
    </Box>
  );
}

function TabCountBadge({ count }) {
  return (
    <Badge
      badgeContent={count}
      aria-label={`${count} thoughts`}
      sx={{
        ml: 1,
        "& .MuiBadge-badge": {
          minWidth: 22,
          height: 22,
          padding: "0 6px",
          borderRadius: 999,
          backgroundColor: "#e5ece1",
          color: "#4c604f",
          fontSize: 10,
          fontWeight: 700,
          position: "static",
          transform: "none",
          ".Mui-selected &": {
            backgroundColor: "rgba(255, 255, 255, 0.14)",
            color: "#ffffff"
          }
        }
      }}
    />
  );
}

export default function App() {
  const [initialData] = useState(loadThoughts);
  const [thoughts, dispatchThoughts] = useReducer(thoughtReducer, initialData.thoughts);
  const [storageError, setStorageError] = useState(initialData.error);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState("capture");
  const [editingId, setEditingId] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [aiStates, setAiStates] = useState({});
  const [hasAiConsent, setHasAiConsent] = useState(loadAiConsent);
  const [pendingAiThoughtId, setPendingAiThoughtId] = useState(null);
  const [hasPlanningAiConsent, setHasPlanningAiConsent] = useState(loadPlanningAiConsent);
  const [pendingPlanningAction, setPendingPlanningAction] = useState(null);
  const [planningAiState, setPlanningAiState] = useState({
    kind: null,
    loading: false,
    thoughtId: null,
    step: "",
    error: ""
  });
  const [consentStorageError, setConsentStorageError] = useState("");
  const aiRequestVersions = useRef({});
  const aiRequests = useRef({});
  const planningRequestVersion = useRef(0);
  const planningRequest = useRef(null);

  useEffect(() => () => {
    Object.values(aiRequests.current).forEach(({ controller, timeoutId }) => {
      clearTimeout(timeoutId);
      controller.abort();
    });
    if (planningRequest.current) {
      clearTimeout(planningRequest.current.timeoutId);
      planningRequest.current.controller.abort();
    }
  }, []);

  const visibleThoughts = useMemo(
    () =>
      activeFilter === "all"
        ? thoughts
        : thoughts.filter((thought) => thought.category === activeFilter),
    [activeFilter, thoughts]
  );
  const doThoughts = useMemo(
    () => thoughts.filter((thought) => thought.category === "do"),
    [thoughts]
  );
  const currentNext = useMemo(
    () => doThoughts.find((thought) => thought.isNext) || null,
    [doThoughts]
  );

  function commitThoughts(action, message) {
    const nextThoughts = thoughtReducer(thoughts, action);
    if (nextThoughts === thoughts) return;
    clearPlanningAiState();
    dispatchThoughts(action);
    setStorageError(saveThoughts(nextThoughts));
    setAnnouncement(message);
  }

  function handleAddThoughts(newThoughts) {
    setActiveFilter("all");
    commitThoughts(
      thoughtActions.addMany(newThoughts),
      `${newThoughts.length} ${newThoughts.length === 1 ? "thought" : "thoughts"} added.`
    );
  }

  function handleSaveThought(id, text, category) {
    setEditingId(null);
    clearAiState(id);
    commitThoughts(
      thoughtActions.update(id, { text, category }),
      `Thought updated and assigned to ${CATEGORY_LABELS[category]}.`
    );
  }

  function handleDeleteThought(id) {
    if (editingId === id) {
      setEditingId(null);
    }
    clearAiState(id);
    commitThoughts(thoughtActions.remove(id), "Thought deleted.");
  }

  function handleReorderThought(id, category, beforeId = null) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || beforeId === id) return;

    commitThoughts(
      thoughtActions.move(id, category, beforeId),
      thought.category === category
        ? `Thought reordered in ${CATEGORY_LABELS[category]}.`
        : `Thought moved to ${CATEGORY_LABELS[category]}.`
    );
  }

  function clearAiState(id) {
    cancelAiRequest(id);
    aiRequestVersions.current[id] = (aiRequestVersions.current[id] || 0) + 1;
    setAiStates((currentStates) => {
      if (!currentStates[id]) return currentStates;
      const nextStates = { ...currentStates };
      delete nextStates[id];
      return nextStates;
    });
  }

  function cancelAiRequest(id) {
    const activeRequest = aiRequests.current[id];
    if (!activeRequest) return;

    clearTimeout(activeRequest.timeoutId);
    activeRequest.controller.abort();
    delete aiRequests.current[id];
  }

  function handleRequestSuggestion(id) {
    if (!hasAiConsent) {
      setPendingAiThoughtId(id);
      return;
    }

    requestCategorySuggestion(id);
  }

  async function requestCategorySuggestion(id) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought) return;

    cancelAiRequest(id);
    const requestVersion = (aiRequestVersions.current[id] || 0) + 1;
    aiRequestVersions.current[id] = requestVersion;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException("AI suggestion timed out.", "TimeoutError"));
    }, AI_REQUEST_TIMEOUT_MS);
    aiRequests.current[id] = { controller, timeoutId, requestVersion };

    setAiStates((currentStates) => ({
      ...currentStates,
      [id]: { loading: true, suggestion: null, error: "" }
    }));

    try {
      const suggestion = await getCategorySuggestion(thought.text, {
        signal: controller.signal
      });
      if (aiRequestVersions.current[id] !== requestVersion) return;
      setAiStates((currentStates) => ({
        ...currentStates,
        [id]: { loading: false, suggestion, error: "" }
      }));
      setAnnouncement(`AI suggested ${CATEGORY_LABELS[suggestion.category]}.`);
    } catch (error) {
      if (aiRequestVersions.current[id] !== requestVersion) return;
      const message =
        error.name === "TimeoutError"
          ? "The AI suggestion timed out. Please try again."
          : error.name === "AbortError"
            ? "The AI suggestion was canceled."
            : error.message;
      setAiStates((currentStates) => ({
        ...currentStates,
        [id]: { loading: false, suggestion: null, error: message }
      }));
      setAnnouncement("AI suggestion failed.");
    } finally {
      const activeRequest = aiRequests.current[id];
      if (activeRequest?.requestVersion === requestVersion) {
        clearTimeout(activeRequest.timeoutId);
        delete aiRequests.current[id];
      }
    }
  }

  function handleCancelAiConsent() {
    setPendingAiThoughtId(null);
    setAnnouncement("AI suggestion canceled. No thought was sent.");
  }

  function handleConfirmAiConsent() {
    const thoughtId = pendingAiThoughtId;
    if (!thoughtId) return;

    setHasAiConsent(true);
    setConsentStorageError(saveAiConsent());
    setPendingAiThoughtId(null);
    requestCategorySuggestion(thoughtId);
  }

  function applyAiChoice(id, category, action) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought) return;

    clearAiState(id);
    commitThoughts(
      thoughtActions.update(id, { category }),
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

  function handleTogglePriority(id) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || thought.category !== "do") return;

    const isPriority = !thought.isPriority;
    commitThoughts(
      thoughtActions.togglePriority(id),
      isPriority ? "Thought marked as a priority." : "Priority removed from thought."
    );
  }

  function handleSelectNext(id) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || thought.category !== "do") return;

    commitThoughts(
      thoughtActions.selectNext(id),
      `Next item selected: ${thought.text}`
    );
  }

  function cancelPlanningRequest() {
    if (!planningRequest.current) return;
    clearTimeout(planningRequest.current.timeoutId);
    planningRequest.current.controller.abort();
    planningRequest.current = null;
  }

  function clearPlanningAiState() {
    cancelPlanningRequest();
    planningRequestVersion.current += 1;
    setPlanningAiState({
      kind: null,
      loading: false,
      thoughtId: null,
      step: "",
      error: ""
    });
  }

  function handlePlanningRequest(kind, thoughtId = null) {
    const selectedThought = thoughts.find((thought) => thought.id === thoughtId);
    const hasValidInput = kind === "first-step"
      ? selectedThought?.category === "do"
      : doThoughts.length > 0;
    if (!hasValidInput) return;

    const action = { kind, thoughtId };
    if (!hasPlanningAiConsent) {
      setPendingPlanningAction(action);
      return;
    }
    requestPlanningSuggestion(action);
  }

  async function requestPlanningSuggestion({ kind, thoughtId = null }) {
    const selectedThought = thoughts.find((thought) => thought.id === thoughtId);
    if (kind === "first-step" && selectedThought?.category !== "do") return;
    if (kind !== "first-step" && doThoughts.length === 0) return;

    cancelPlanningRequest();
    const requestVersion = planningRequestVersion.current + 1;
    planningRequestVersion.current = requestVersion;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException("AI suggestion timed out.", "TimeoutError"));
    }, AI_REQUEST_TIMEOUT_MS);
    planningRequest.current = { controller, timeoutId, requestVersion };

    setPlanningAiState({
      kind,
      loading: true,
      thoughtId: kind === "first-step" ? thoughtId : null,
      step: "",
      error: ""
    });

    try {
      let result;
      if (kind === "first-step") {
        result = await getFirstStepSuggestion(selectedThought.text, {
          signal: controller.signal
        });
      } else {
        const requestThoughts = doThoughts.map(({ id, text, isPriority }) => ({
          id,
          text,
          isPriority
        }));
        result = kind === "priority"
          ? await getPrioritySuggestion(requestThoughts, { signal: controller.signal })
          : await getNextSuggestion(requestThoughts, { signal: controller.signal });
      }

      if (planningRequestVersion.current !== requestVersion) return;
      if (kind === "first-step") {
        setPlanningAiState({
          kind,
          loading: false,
          thoughtId,
          step: result.step,
          error: ""
        });
      } else {
        const resultIsCurrent = doThoughts.some((thought) => thought.id === result.thoughtId);
        if (!resultIsCurrent) throw new Error("The AI selected an item that is no longer active.");
        setPlanningAiState({
          kind,
          loading: false,
          thoughtId: result.thoughtId,
          step: "",
          error: ""
        });
      }
      setAnnouncement("AI focus suggestion ready. Review it before applying.");
    } catch (error) {
      if (planningRequestVersion.current !== requestVersion) return;
      const message = error.name === "TimeoutError"
        ? "The AI suggestion timed out. Please try again."
        : error.name === "AbortError"
          ? "The AI suggestion was canceled."
          : error.message;
      setPlanningAiState({
        kind,
        loading: false,
        thoughtId: kind === "first-step" ? thoughtId : null,
        step: "",
        error: message
      });
      setAnnouncement("AI focus suggestion failed.");
    } finally {
      if (planningRequest.current?.requestVersion === requestVersion) {
        clearTimeout(planningRequest.current.timeoutId);
        planningRequest.current = null;
      }
    }
  }

  function handleCancelPlanningConsent() {
    setPendingPlanningAction(null);
    setAnnouncement("AI suggestion canceled. No thoughts were sent.");
  }

  function handleConfirmPlanningConsent() {
    const action = pendingPlanningAction;
    if (!action) return;
    setHasPlanningAiConsent(true);
    setConsentStorageError(savePlanningAiConsent());
    setPendingPlanningAction(null);
    requestPlanningSuggestion(action);
  }

  function handleApplyFirstStep(id, step) {
    const trimmedStep = step.trim();
    if (!trimmedStep) return;
    clearAiState(id);
    commitThoughts(
      thoughtActions.update(id, { text: trimmedStep }),
      "Thought replaced with a smaller first step."
    );
  }

  function switchView(view) {
    setActiveView(view);
    setEditingId(null);
    setAnnouncement(view === "capture" ? "Capture view opened." : "Organize view opened.");
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
      {consentStorageError && <p className="error-message" role="alert">{consentStorageError}</p>}

      <nav className="view-navigation" aria-label="Brain Dump sections">
        <Tabs
          value={activeView}
          onChange={(_event, value) => switchView(value)}
          aria-label="Capture and organize"
          className="view-tabs"
          selectionFollowsFocus
        >
          <Tab
            value="capture"
            id="capture-tab"
            aria-controls="capture-panel"
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                <TabNumberBadge>01</TabNumberBadge>
                Capture
              </Box>
            }
          />
          <Tab
            value="organize"
            id="organize-tab"
            aria-controls="organize-panel"
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <TabNumberBadge>02</TabNumberBadge>
                Organize
                <TabCountBadge count={thoughts.length} />
              </Box>
            }
          />
        </Tabs>
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
              AI tools require consent before thought text is sent to Groq.
            </p>
            {thoughts.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => switchView("organize")}
                endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
              >
                Organize {thoughts.length} {thoughts.length === 1 ? "thought" : "thoughts"}
              </Button>
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

          <FocusTools
            doThoughts={doThoughts}
            currentNext={currentNext}
            aiState={planningAiState}
            onSuggestPriority={() => handlePlanningRequest("priority")}
            onRecommendNext={() => handlePlanningRequest("next")}
            onApplyPriority={(id) => {
              const thought = thoughts.find((item) => item.id === id);
              if (thought?.category === "do" && !thought.isPriority) {
                handleTogglePriority(id);
              }
            }}
            onApplyNext={handleSelectNext}
            onDismissSuggestion={clearPlanningAiState}
          />

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
            onTogglePriority={handleTogglePriority}
            onSelectNext={handleSelectNext}
            planningAiState={planningAiState}
            onRequestFirstStep={(id) => handlePlanningRequest("first-step", id)}
            onApplyFirstStep={handleApplyFirstStep}
            onDismissPlanningSuggestion={clearPlanningAiState}
            aiStates={aiStates}
            onRequestSuggestion={handleRequestSuggestion}
            onAcceptSuggestion={(id, category) => applyAiChoice(id, category, "accepted")}
            onOverrideSuggestion={(id, category) => applyAiChoice(id, category, "overridden")}
          />
        </section>
      </div>

      <AiConsentDialog
        open={Boolean(pendingAiThoughtId)}
        thoughtText={thoughts.find((thought) => thought.id === pendingAiThoughtId)?.text || ""}
        onCancel={handleCancelAiConsent}
        onConfirm={handleConfirmAiConsent}
      />

      <AiConsentDialog
        open={Boolean(pendingPlanningAction)}
        title="Before using AI focus tools"
        description="Brain Dump uses Groq, an external AI provider. Priority and Next recommendations send the text of all active Do thoughts for comparison. First-step suggestions send only the selected Do thought. Unsorted, Decide, and Let Go thoughts are not sent."
        thoughtTexts={pendingPlanningAction?.kind === "first-step"
          ? thoughts
              .filter((thought) => thought.id === pendingPlanningAction.thoughtId)
              .map((thought) => thought.text)
          : doThoughts.map((thought) => thought.text)}
        confirmLabel="I understand — send to Groq"
        onCancel={handleCancelPlanningConsent}
        onConfirm={handleConfirmPlanningConsent}
      />

      <footer>A little room for what matters.</footer>
    </main>
  );
}
