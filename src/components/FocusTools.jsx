import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

export default function FocusTools({
  doThoughts,
  currentNext,
  aiState,
  onShowDo,
  onCompleteNext,
  onClearNext,
  onRequestFirstStep,
  onApplyFirstStep,
  onSuggestPriority,
  onRecommendNext,
  onApplyPriority,
  onApplyNext,
  onDismissSuggestion
}) {
  const [isChangingNext, setIsChangingNext] = useState(false);
  const suggestedThought = doThoughts.find(
    (thought) => thought.id === aiState.thoughtId
  );
  const isListRequest = aiState.loading && ["priority", "next"].includes(aiState.kind);
  const isCurrentFirstStep =
    currentNext &&
    aiState.kind === "first-step" &&
    aiState.thoughtId === currentNext.id;

  return (
    <section className={`focus-tools${currentNext ? " has-next" : ""}`} aria-labelledby="focus-tools-heading">
      {currentNext ? (
        <div className="next-step-card">
          <div className="next-step-copy">
            <p className="section-kicker">YOUR NEXT STEP</p>
            <h3 id="focus-tools-heading">{currentNext.text}</h3>
            <p>Keep the rest out of view for a moment. Move this one thing forward.</p>
          </div>
          <div className="next-step-actions">
            <Button
              variant="contained"
              startIcon={<CheckRoundedIcon />}
              onClick={() => onCompleteNext(currentNext.id)}
            >
              Done
            </Button>
            <Button variant="outlined" onClick={() => onClearNext(currentNext.id)}>
              Not now
            </Button>
            <Button
              variant="text"
              startIcon={
                aiState.loading && isCurrentFirstStep
                  ? <CircularProgress size={16} color="inherit" />
                  : <AutoAwesomeRoundedIcon fontSize="small" />
              }
              disabled={aiState.loading}
              onClick={() => onRequestFirstStep(currentNext.id)}
            >
              {aiState.loading && isCurrentFirstStep ? "Making it smaller…" : "Make it smaller"}
            </Button>
            <Button
              variant="text"
              endIcon={<KeyboardArrowRightRoundedIcon />}
              aria-expanded={isChangingNext}
              aria-controls="next-item-chooser"
              onClick={() => setIsChangingNext((isOpen) => !isOpen)}
            >
              Change Next
            </Button>
          </div>

          {isChangingNext && (
            <div id="next-item-chooser" className="next-item-chooser" aria-label="Choose a new Next item">
              <div className="next-item-chooser-heading">
                <div>
                  <span>Choose a new Next</span>
                  <p>Pick one item from Do. Your current Next stays selected until you choose.</p>
                </div>
                <Button size="small" variant="text" onClick={() => setIsChangingNext(false)}>
                  Cancel
                </Button>
              </div>
              <div className="next-item-options">
                {doThoughts.map((thought) => {
                  const isCurrent = thought.id === currentNext.id;
                  return (
                    <Button
                      key={thought.id}
                      variant={isCurrent ? "contained" : "outlined"}
                      disabled={isCurrent}
                      aria-label={isCurrent ? `${thought.text}, current Next` : `Make ${thought.text} Next`}
                      onClick={() => {
                        onApplyNext(thought.id);
                        setIsChangingNext(false);
                      }}
                    >
                      <span>{thought.text}</span>
                      <small>{isCurrent ? "Current" : "Choose"}</small>
                    </Button>
                  );
                })}
              </div>
              {doThoughts.length === 1 && (
                <p className="next-item-chooser-empty">Move another thought to Do before changing Next.</p>
              )}
            </div>
          )}

          {isCurrentFirstStep && aiState.error && (
            <Alert severity="error" variant="outlined" onClose={onDismissSuggestion}>
              {aiState.error}
            </Alert>
          )}

          {isCurrentFirstStep && aiState.step && (
            <div className="next-step-suggestion" aria-label="AI first-step suggestion">
              <div>
                <span>Smaller first step</span>
                <p>{aiState.step}</p>
              </div>
              <div>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onApplyFirstStep(currentNext.id, aiState.step)}
                >
                  Use this step
                </Button>
                <Button variant="text" size="small" onClick={onDismissSuggestion}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="focus-empty-state">
          <div>
            <p className="section-kicker">FOCUS</p>
            <h3 id="focus-tools-heading">Choose one thing to move forward</h3>
            <p>
              {doThoughts.length > 0
                ? `${doThoughts.length} ${doThoughts.length === 1 ? "item is" : "items are"} ready to act on.`
                : "Move a thought to Do when you know the next action."}
            </p>
          </div>
          <Button
            variant={doThoughts.length > 0 ? "contained" : "outlined"}
            endIcon={<KeyboardArrowRightRoundedIcon />}
            onClick={onShowDo}
          >
            {doThoughts.length > 0 ? "Choose from Do" : "Review thoughts"}
          </Button>
        </div>
      )}

      <details className="focus-ai-drawer">
        <summary>
          <span className="focus-ai-summary-title">
            <AutoAwesomeRoundedIcon aria-hidden="true" fontSize="small" />
            Need help choosing?
          </span>
          <span className="focus-ai-summary-hint">AI suggestions</span>
        </summary>
        <div className="focus-ai-content">
          <div className="focus-tool-actions">
            <Button
              variant="outlined"
              size="small"
              startIcon={
                isListRequest && aiState.kind === "priority"
                  ? <CircularProgress size={14} color="inherit" />
                  : <AutoAwesomeRoundedIcon fontSize="small" />
              }
              disabled={doThoughts.length === 0 || isListRequest}
              onClick={onSuggestPriority}
            >
              {isListRequest && aiState.kind === "priority" ? "Choosing…" : "Suggest a priority"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                isListRequest && aiState.kind === "next"
                  ? <CircularProgress size={14} color="inherit" />
                  : <AutoAwesomeRoundedIcon fontSize="small" />
              }
              disabled={doThoughts.length === 0 || isListRequest}
              onClick={onRecommendNext}
            >
              {isListRequest && aiState.kind === "next" ? "Choosing…" : "Recommend my Next item"}
            </Button>
          </div>

          {doThoughts.length === 0 && (
            <p className="focus-tools-empty">Assign at least one thought to Do to use AI focus help.</p>
          )}

          {aiState.error && ["priority", "next"].includes(aiState.kind) && (
            <Alert severity="error" variant="outlined" onClose={onDismissSuggestion}>
              {aiState.error}
            </Alert>
          )}

          {suggestedThought && ["priority", "next"].includes(aiState.kind) && (
            <div className="focus-suggestion" aria-label={`AI ${aiState.kind} suggestion`}>
              <AutoAwesomeRoundedIcon aria-hidden="true" fontSize="small" />
              <p>
                AI suggests <strong>{suggestedThought.text}</strong> as your {aiState.kind === "priority" ? "priority" : "Next item"}.
              </p>
              <Button
                variant="contained"
                size="small"
                onClick={() => aiState.kind === "priority"
                  ? onApplyPriority(suggestedThought.id)
                  : onApplyNext(suggestedThought.id)}
                disabled={aiState.kind === "priority"
                  ? suggestedThought.isPriority
                  : suggestedThought.isNext}
              >
                {aiState.kind === "priority"
                  ? suggestedThought.isPriority ? "Already a priority" : "Mark as priority"
                  : suggestedThought.isNext ? "Already Next" : "Make this Next"}
              </Button>
              <Button variant="text" size="small" onClick={onDismissSuggestion}>
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
