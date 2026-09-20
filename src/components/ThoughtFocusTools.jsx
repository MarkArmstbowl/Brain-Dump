import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function ThoughtFocusTools({
  thought,
  planningAiState,
  onSelectNext,
  onRequestFirstStep,
  onApplyFirstStep,
  onDismissPlanningSuggestion
}) {
  const isThisRequest = planningAiState?.thoughtId === thought.id;
  const isFirstStepState = planningAiState?.kind === "first-step" && isThisRequest;

  return (
    <div className="card-focus-tools">
      <div className="card-focus-actions">
        <Button
          variant={thought.isNext ? "contained" : "outlined"}
          size="small"
          disabled={thought.isNext}
          onClick={onSelectNext}
        >
          {thought.isNext ? "Current Next" : "Make Next"}
        </Button>
        <Button
          variant="text"
          size="small"
          startIcon={
            planningAiState?.loading && isThisRequest
              ? <CircularProgress size={14} color="inherit" />
              : <AutoAwesomeRoundedIcon fontSize="small" />
          }
          disabled={planningAiState?.loading}
          onClick={onRequestFirstStep}
        >
          {planningAiState?.loading && isThisRequest
            ? "Breaking down…"
            : "Break into first step"}
        </Button>
      </div>

      {isFirstStepState && planningAiState.error && (
        <p className="ai-error" role="alert">{planningAiState.error}</p>
      )}

      {isFirstStepState && planningAiState.step && (
        <div className="first-step-suggestion" aria-label="AI first-step suggestion">
          <p><strong>Smaller first step:</strong> {planningAiState.step}</p>
          <div>
            <Button
              variant="contained"
              size="small"
              onClick={() => onApplyFirstStep(planningAiState.step)}
            >
              Use this first step
            </Button>
            <Button variant="text" size="small" onClick={onDismissPlanningSuggestion}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
