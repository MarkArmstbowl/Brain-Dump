export async function getCategorySuggestion(thought, { signal } = {}) {
  const response = await fetch("/api/category-suggestion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thought }),
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

export async function getBatchCategorySuggestions(thoughts, { signal } = {}) {
  const response = await fetch("/api/batch-category-suggestions", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thoughts: thoughts.map(({ id, text }) => ({ id, text })) }), signal
  });
  let result;
  try { result = await response.json(); }
  catch { throw new Error("The AI service returned an unreadable response."); }
  if (!response.ok) throw new Error(result.error || "Categories could not be suggested.");
  return result.suggestions;
}
