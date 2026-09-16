import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CATEGORIES } from "../constants";

const FILTERS = [{ value: "all", label: "All" }, ...CATEGORIES];

const CATEGORY_ACTIVE_COLORS = {
  unsorted: "#68716a",
  do: "#52795a",
  decide: "#9b772f",
  "let-go": "#7d5d7d"
};

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
      sx={{
        "& .MuiToggleButton-root": {
          // Preserve per-category active colors so the UI keeps its
          // existing visual cues after the Material migration.
          "&[value='unsorted'].Mui-selected": {
            borderColor: CATEGORY_ACTIVE_COLORS.unsorted,
            backgroundColor: CATEGORY_ACTIVE_COLORS.unsorted,
            "&:hover": { backgroundColor: "#535a54" }
          },
          "&[value='do'].Mui-selected": {
            borderColor: CATEGORY_ACTIVE_COLORS.do,
            backgroundColor: CATEGORY_ACTIVE_COLORS.do,
            "&:hover": { backgroundColor: "#426249" }
          },
          "&[value='decide'].Mui-selected": {
            borderColor: CATEGORY_ACTIVE_COLORS.decide,
            backgroundColor: CATEGORY_ACTIVE_COLORS.decide,
            "&:hover": { backgroundColor: "#7e6326" }
          },
          "&[value='let-go'].Mui-selected": {
            borderColor: CATEGORY_ACTIVE_COLORS["let-go"],
            backgroundColor: CATEGORY_ACTIVE_COLORS["let-go"],
            "&:hover": { backgroundColor: "#624a62" }
          }
        }
      }}
    >
      {FILTERS.map((filter) => (
        <ToggleButton key={filter.value} value={filter.value} aria-label={`Show ${filter.label}`}>
          {filter.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}