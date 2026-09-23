export const CATEGORIES = [
  { value: "unsorted", label: "Unsorted" },
  { value: "do", label: "Do" },
  { value: "decide", label: "Decide" },
  { value: "let-go", label: "Let Go" }
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map(({ value, label }) => [value, label])
);

export const CATEGORY_DESCRIPTIONS = {
  unsorted: "Not sorted yet",
  do: "Ready to act",
  decide: "Needs a decision",
  "let-go": "No action needed"
};
