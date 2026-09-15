import { CATEGORIES } from "../constants";

const FILTERS = [{ value: "all", label: "All" }, ...CATEGORIES];

export default function ThoughtFilters({ activeFilter, onChange }) {
  return (
    <div className="thought-filters" aria-label="Filter thoughts">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            className={`filter-button filter-${filter.value}${isActive ? " is-active" : ""}`}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(filter.value, filter.label)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
