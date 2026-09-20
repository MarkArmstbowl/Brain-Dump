import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function FocusTools({
  doThoughts,
  currentNext,
  aiState,
  onSuggestPriority,
  onRecommendNext,
  onApplyPriority,
  onApplyNext,
  onDismissSuggestion
}) {
  const suggestedThought = doThoughts.find(
    (thought) => thought.id === aiState.thoughtId
  );
  const isListRequest = aiState.loading && ["priority", "next"].includes(aiState.kind);

  return (
    <section className="focus-tools" aria-labelledby="focus-tools-heading">
      <div className="focus-tools-heading">
        <div>
          <p className="section-kicker">FOCUS</p>
          <h3 id="focus-tools-heading">Choose what moves next</h3>
        </div>
        <p className="current-next-summary">
          {currentNext ? <>Next: <strong>{currentNext.text}</strong></> : "No Next item selected yet."}
        </p>
      </div>

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
        <p className="focus-tools-empty">Assign at least one thought to Do to use focus tools.</p>
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
    </section>
  );
}
