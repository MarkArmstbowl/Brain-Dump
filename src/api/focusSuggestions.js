async function postSuggestion(path, body, signal) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The AI service returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(result.error || "The AI suggestion could not be created.");
  }
  return result;
}

export function getPrioritySuggestion(thoughts, { signal } = {}) {
  return postSuggestion("/api/priority-suggestion", { thoughts }, signal);
}

export function getNextSuggestion(thoughts, { signal } = {}) {
  return postSuggestion("/api/next-suggestion", { thoughts }, signal);
}

export function getFirstStepSuggestion(thought, { signal } = {}) {
  return postSuggestion("/api/first-step-suggestion", { thought }, signal);
}
