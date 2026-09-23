import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CATEGORIES } from "../constants";

const FILTERS = [{ value: "all", label: "All" }, ...CATEGORIES];

export default function ThoughtFilters({ activeFilter, onChange }) {
  function handleChange(_event, nextValue) {
    if (nextValue === null) return; // exclusive group: don't allow deselect
    const match = FILTERS.find((filter) => filter.value === nextValue);
    if (match) onChange(match.value, match.label);
  }

  return (
    <ToggleButtonGroup
      value={activeFilter}
      exclusive
      onChange={handleChange}
      aria-label="Filter thoughts"
      className="thought-filters"
    >
      {FILTERS.map((filter) => (
        <ToggleButton key={filter.value} value={filter.value} aria-label={`Show ${filter.label}`}>
          {filter.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
