import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import AiConsentDialog from "./AiConsentDialog";
import CategorySelect from "./CategorySelect";
import { getBatchCategorySuggestions } from "../api/categorySuggestion";

export default function BulkCategoryTools({ thoughts, onApply }) {
  const [consentOpen, setConsentOpen] = useState(false);
  const [state, setState] = useState({ loading: false, suggestions: [], error: "" });
  const request = useRef(null);
  const version = useRef(0);
  useEffect(() => {
    version.current += 1;
    request.current?.abort();
    setConsentOpen(false);
    setState({ loading: false, suggestions: [], error: "" });
    return () => { version.current += 1; request.current?.abort(); };
  }, [thoughts]);

  async function suggest() {
    setConsentOpen(false);
    const current = ++version.current;
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(new DOMException("Suggestion timed out. Try again.", "TimeoutError")), 15000);
    setState({ loading: true, suggestions: [], error: "" });
    try {
      const suggestions = await getBatchCategorySuggestions(thoughts, { signal: controller.signal });
      if (version.current === current) setState({ loading: false, suggestions, error: "" });
    } catch (error) {
      if (version.current === current) setState({ loading: false, suggestions: [], error: error.message });
    } finally { clearTimeout(timeout); }
  }
  return <details className="v3-panel">
    <summary>Categorize the whole dump with AI</summary>
    <p>Review every category before applying. Sends all active thought text to Groq, including Decide and Let Go.</p>
    <Button disabled={!thoughts.length || thoughts.length > 50 || state.loading} onClick={() => setConsentOpen(true)}>
      {state.loading ? "Suggesting categories…" : state.suggestions.length ? "Ask for another batch suggestion" : "Suggest categories for whole dump"}
    </Button>
    {thoughts.length > 50 && <p role="alert">Whole-dump suggestions support up to 50 active thoughts.</p>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.suggestions.length > 0 && <div aria-label="Review whole-dump categories">
      {state.suggestions.map((choice) => <div className="batch-choice" key={choice.id}>
        <p>{thoughts.find(({ id }) => id === choice.id)?.text}</p>
        <p>{choice.reason}</p>
        <CategorySelect id={`batch-${choice.id}`} label="Reviewed category" value={choice.category}
          onChange={(category) => setState((value) => ({ ...value, suggestions: value.suggestions.map((item) => item.id === choice.id ? { ...item, category } : item) }))} />
      </div>)}
      <Button onClick={() => onApply(state.suggestions)}>Apply reviewed categories</Button>
      <Button onClick={() => setState({ loading: false, suggestions: [], error: "" })}>Dismiss batch suggestion</Button>
    </div>}
    <AiConsentDialog open={consentOpen} title="Before categorizing the whole dump"
      description="All active thought text listed below will be sent to Groq for category suggestions and short explanations. Nothing changes until you review and apply the results."
      thoughtTexts={thoughts.map(({ text }) => text)} onCancel={() => setConsentOpen(false)} onConfirm={suggest} />
  </details>;
}
