import { savedThoughts, updateSavedThought, returnSavedThought } from "./state/savedThoughts";
import { isActive } from "./domain/thoughts";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { CATEGORY_LABELS } from "./constants";
import { getCategorySuggestion } from "./api/categorySuggestion";
import {
  getFirstStepSuggestion,
  getNextSuggestion,
  getPrioritySuggestion
} from "./api/focusSuggestions";
import BulkCategoryTools from "./components/BulkCategoryTools";
import AiConsentDialog from "./components/AiConsentDialog";
import SavedThoughts from "./components/SavedThoughts";
import ThoughtReminders from "./components/ThoughtReminders";
import ThoughtCollections from "./components/ThoughtCollections";
import CompletedThoughts from "./components/CompletedThoughts";
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
import { loadWorkspace, saveWorkspace, startDump, updateCurrentDump } from "./storage/workspaceStorage";
import ReviewInsights from "./components/ReviewInsights";
import DumpHistory from "./components/DumpHistory";
import { thoughtActions, thoughtReducer } from "./state/thoughtReducer";

const AI_REQUEST_TIMEOUT_MS = 15_000;

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
          backgroundColor: "var(--bd-primary-container)",
          color: "var(--bd-on-primary-container)",
          fontSize: 10,
          fontWeight: 700,
          position: "static",
          transform: "none",
          ".Mui-selected &": {
            backgroundColor: "rgba(255, 255, 255, 0.14)",
            color: "var(--bd-on-primary)"
          }
        }
      }}
    />
  );
}

export default function App() {
  const [initialData] = useState(loadWorkspace);
  const [workspace, setWorkspace] = useState(initialData.workspace);
  const [thoughts, dispatchThoughts] = useReducer(thoughtReducer, initialData.thoughts);
  const [storageError, setStorageError] = useState(initialData.error);
  const [search, setSearch] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState("capture");
  const [editingId, setEditingId] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const feedbackSequence = useRef(0);
  const [feedback, setFeedback] = useState({ message: "", undoThoughtId: null, undoAction: null });
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

  const activeThoughts = useMemo(
    () => thoughts.filter((thought) => isActive(thought)),
    [thoughts]
  );
  const completedThoughts = useMemo(
    () => thoughts.filter((thought) => thought.status === "completed"),
    [thoughts]
  );
  const visibleThoughts = useMemo(
    () =>
      activeThoughts.filter((thought) => (activeFilter === "all" || thought.category === activeFilter) &&
        thought.text.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
    [activeFilter, activeThoughts, search]
  );
  const doThoughts = useMemo(
    () => activeThoughts.filter((thought) => thought.category === "do"),
    [activeThoughts]
  );
  const allSavedThoughts = useMemo(() => savedThoughts(workspace), [workspace]);
  const currentNext = useMemo(
    () => doThoughts.find((thought) => thought.isNext) || null,
    [doThoughts]
  );

  function showFeedback(value) {
    setFeedback({ ...value, id: ++feedbackSequence.current });
  }

  function commitWorkspace(nextWorkspace, message, { undoThoughtId = null, undoAction = null, requireSave = false } = {}) {
    if (initialData.blocked || nextWorkspace === workspace) return false;
    const error = saveWorkspace(nextWorkspace);
    setStorageError(error);
    if (requireSave && error) return false;
    const nextThoughts = nextWorkspace.dumps.find(({ id }) => id === nextWorkspace.currentId).thoughts;
    clearPlanningAiState();
    thoughts.forEach((thought) => {
      const next = nextThoughts.find((item) => item.id === thought.id);
      if (!next || next.text !== thought.text || next.category !== thought.category || next.status !== thought.status) clearAiState(thought.id);
    });
    dispatchThoughts(thoughtActions.replace(nextThoughts));
    setWorkspace(nextWorkspace);
    setAnnouncement(message);
    showFeedback({ message, undoThoughtId, undoAction });
    return true;
  }

  function commitThoughts(action, message, options = {}) {
    const nextThoughts = thoughtReducer(thoughts, action);
    if (nextThoughts === thoughts) return false;
    return commitWorkspace(updateCurrentDump(workspace, nextThoughts), message, options);
  }

  function handleStartDump(title) {
    const nextWorkspace = startDump(updateCurrentDump(workspace, thoughts), title);
    if (!commitWorkspace(nextWorkspace, "Previous dump saved. New dump started.", { requireSave: true })) return false;
    setPendingAiThoughtId(null);
    setPendingPlanningAction(null);
    setEditingId(null);
    setSearch("");
    setActiveFilter("all");
    setAnnouncement("New dump started. Previous thoughts are available in History.");
    return true;
  }

  function handleAddThoughts(newThoughts) {
    setActiveFilter("all");
    return commitThoughts(
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
    const index = thoughts.findIndex((thought) => thought.id === id);
    if (index < 0) return;
    commitThoughts(thoughtActions.remove(id), "Thought deleted.", {
      undoAction: thoughtActions.restoreRemoved([{ thought: thoughts[index], index }])
    });
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
    if (!thought || thought.category !== "do" || !isActive(thought)) return;

    const isPriority = !thought.isPriority;
    commitThoughts(
      thoughtActions.togglePriority(id),
      isPriority ? "Thought marked as a priority." : "Priority removed from thought."
    );
  }

  function handleSelectNext(id) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || thought.category !== "do" || !isActive(thought)) return;

    commitThoughts(
      thoughtActions.selectNext(id),
      `Next item selected: ${thought.text}`
    );
  }

  function handleClearNext(id) {
    commitThoughts(
      thoughtActions.clearNext(id),
      "Next cleared. The thought stays in Do."
    );
  }

  function handleCompleteThought(id) {
    const thought = thoughts.find((item) => item.id === id);
    if (!thought || !isActive(thought)) return;
    clearAiState(id);
    commitThoughts(
      thoughtActions.complete(id),
      "Completed. Nice work.",
      { undoThoughtId: id }
    );
  }

  function handleRestoreThought(id) {
    if (allSavedThoughts.some((thought) => thought.id === id)) {
      return commitWorkspace(returnSavedThought(workspace, id), "Saved thought returned to the current dump.");
    }
    return commitThoughts(
      thoughtActions.restore(id),
      "Thought restored to your active list."
    );
  }

  function handleShowDoThoughts() {
    const nextFilter = doThoughts.length > 0 ? "do" : "all";
    handleFilterChange(nextFilter, nextFilter === "do" ? "Do" : "All");
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
    setAnnouncement(`${view === "capture" ? "Capture" : view === "history" ? "History" : view === "review" ? "Review" : "Organize"} view opened.`);
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
          aria-label="Brain Dump workspaces"
          className="view-tabs"
          selectionFollowsFocus
        >
          <Tab
            value="capture"
            id="capture-tab"
            aria-controls="capture-panel"
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                <EditNoteRoundedIcon fontSize="small" />
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
                <DashboardRoundedIcon fontSize="small" />
                Organize
                <TabCountBadge count={activeThoughts.length} />
              </Box>
            }
          />
          <Tab value="history" id="history-tab" aria-controls="history-panel" label="History" icon={<HistoryRoundedIcon fontSize="small" />} iconPosition="start" />
          <Tab value="review" id="review-tab" aria-controls="review-panel" label="Review" icon={<InsightsRoundedIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </nav>

      <div className="session-strip">
        <p className="current-dump-name">Current dump: {workspace.dumps.find(({ id }) => id === workspace.currentId)?.title}</p>
        <span className="session-count">{activeThoughts.length} active · {completedThoughts.length} completed</span>
      </div>
      <ThoughtReminders thoughts={allSavedThoughts} onRestore={handleRestoreThought}
        onAcknowledge={(id) => commitWorkspace(updateSavedThought(workspace, id, thoughtActions.acknowledgeReminder(id)), "Reminder dismissed for this revisit date.")} />
      <div className="workspace">
        <section id="review-panel" className="workspace-view" role="tabpanel" aria-labelledby="review-tab" hidden={activeView !== "review"}>
          <ReviewInsights key={workspace.currentId} workspace={workspace} onSaveReflection={(reflection) => {
            if (initialData.blocked) return;
            const next = { ...workspace, dumps: workspace.dumps.map((dump) => dump.id === workspace.currentId ? { ...dump, reflection } : dump) };
            commitWorkspace(next, "Reflection saved.");
          }} />
        </section>
        <section id="history-panel" className="workspace-view" role="tabpanel" aria-labelledby="history-tab" hidden={activeView !== "history"}>
          <DumpHistory workspace={workspace} onStart={handleStartDump} />
        </section>
        <section
          id="capture-panel"
          className="capture-column workspace-view"
          role="tabpanel"
          aria-labelledby="capture-tab"
          hidden={activeView !== "capture"}
        >
          <div className="capture-intro">
            <p className="section-kicker">LESS MENTAL CLUTTER. MORE CLARITY.</p>
            <h2>Make space for what matters.</h2>
            <p>Get it out of your head. Find a place for it. Take one small step.</p>
          </div>
          <div className="capture-stage">
            <span className="ambient-card ambient-card-left" aria-hidden="true" />
            <span className="ambient-card ambient-card-right" aria-hidden="true" />
            <span className="ambient-orbit ambient-orbit-left" aria-hidden="true" />
            <span className="ambient-orbit ambient-orbit-right" aria-hidden="true" />
            <span className="ambient-spark ambient-spark-one" aria-hidden="true">✦</span>
            <span className="ambient-spark ambient-spark-two" aria-hidden="true">✧</span>
            <ThoughtComposer onAddThoughts={handleAddThoughts} />
          </div>
          <div className="capture-guide" aria-label="Ways to organize your thoughts">
            <div className="guide-do"><span aria-hidden="true">↗</span><div><h3>Do</h3><p>Something you can act on.</p></div></div>
            <div className="guide-decide"><span aria-hidden="true">◇</span><div><h3>Decide</h3><p>A choice that needs clarity.</p></div></div>
            <div className="guide-let-go"><span aria-hidden="true">≈</span><div><h3>Let Go</h3><p>Something you can release.</p></div></div>
          </div>
          <div className="capture-aftercare">
            <p className="privacy-note">
              <span aria-hidden="true">●</span>
              AI tools require consent before thought text is sent to Groq.
            </p>
            {activeThoughts.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => switchView("organize")}
                endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
              >
                Organize {activeThoughts.length} {activeThoughts.length === 1 ? "thought" : "thoughts"}
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
              {activeThoughts.length} {activeThoughts.length === 1 ? "thought" : "thoughts"}
            </span>
          </div>

          <FocusTools
            doThoughts={doThoughts}
            currentNext={currentNext}
            aiState={planningAiState}
            onShowDo={handleShowDoThoughts}
            onCompleteNext={handleCompleteThought}
            onClearNext={handleClearNext}
            onRequestFirstStep={(id) => handlePlanningRequest("first-step", id)}
            onApplyFirstStep={handleApplyFirstStep}
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

          <div className="dump-tools">
            <TextField label="Search current thoughts" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button disabled={!doThoughts.length} onClick={() => commitThoughts(thoughtActions.sortPriority(), "Do items reordered by priority.")}>Reorder by priority</Button>
            <Button color="error" disabled={!activeThoughts.length} onClick={() => setClearOpen(true)}>Clear current dump</Button>
          </div>
          <BulkCategoryTools thoughts={activeThoughts} onApply={(choices) => {
            choices.forEach(({ id }) => clearAiState(id));
            commitThoughts(thoughtActions.categorizeMany(choices), "Reviewed categories applied.");
          }} />
          <ThoughtFilters activeFilter={activeFilter} onChange={handleFilterChange} />
          <ThoughtList
            thoughts={visibleThoughts}
            hasAnyThoughts={activeThoughts.length > 0}
            grouped={activeFilter === "all"}
            editingId={editingId}
            onEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onSave={handleSaveThought}
            onDelete={handleDeleteThought}
            onReorder={handleReorderThought}
            onSaveLater={(id, date) => commitThoughts(thoughtActions.saveLater(id, date), "Thought saved for later.", { undoThoughtId: id })}
            onComplete={handleCompleteThought}
            onRecordDecision={(id, decision) => commitThoughts(thoughtActions.recordDecision(id, decision), "Decision recorded.")}
            onResolve={(id) => commitThoughts(thoughtActions.resolve(id), "Decision resolved.", { undoThoughtId: id })}
            onDismiss={(id) => commitThoughts(thoughtActions.dismiss(id), "Thought dismissed.", { undoThoughtId: id })}
            onSetPriority={(id, priority) => commitThoughts(thoughtActions.setPriority(id, priority), "Priority level changed.")}
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

          <SavedThoughts thoughts={allSavedThoughts} onRestore={handleRestoreThought}
            onSetDate={(id, date) => commitWorkspace(updateSavedThought(workspace, id, thoughtActions.setRevisitDate(id, date)), "Revisit date updated.")} />
          <ThoughtCollections thoughts={thoughts} onRestore={handleRestoreThought}
            onUnarchive={(id) => commitThoughts(thoughtActions.unarchive(id), "Thought returned to Completed.")} />
          <CompletedThoughts
            thoughts={completedThoughts}
            onRestore={handleRestoreThought}
            onArchive={(id) => commitThoughts(thoughtActions.archive(id), "Completed thought archived.")}
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

      <Dialog open={clearOpen} onClose={() => setClearOpen(false)}>
        <DialogTitle>Clear current dump?</DialogTitle>
        <DialogContent>Remove all {activeThoughts.length} active thoughts? Completed and other inactive items are kept. You can undo this action.</DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOpen(false)}>Cancel</Button>
          <Button color="error" onClick={() => {
            const entries = thoughts.map((thought, index) => ({ thought, index })).filter(({ thought }) => isActive(thought));
            entries.forEach(({ thought }) => clearAiState(thought.id));
            setClearOpen(false);
            setEditingId(null);
            commitThoughts(thoughtActions.clearActive(), "Current dump cleared.", { undoAction: thoughtActions.restoreRemoved(entries) });
          }}>Clear thoughts</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={feedback.id}
        open={Boolean(feedback.message)}
        autoHideDuration={3600}
        onClose={(_event, reason) => {
          if (reason !== "clickaway") {
            showFeedback({ message: "", undoThoughtId: null, undoAction: null });
          }
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          action={feedback.undoThoughtId || feedback.undoAction ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => feedback.undoAction
                ? commitThoughts(feedback.undoAction, "Change undone.")
                : handleRestoreThought(feedback.undoThoughtId)}
            >
              Undo
            </Button>
          ) : undefined}
          onClose={() => showFeedback({ message: "", undoThoughtId: null, undoAction: null })}
          role="status"
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <footer>A little room for what matters.</footer>
    </main>
  );
}
