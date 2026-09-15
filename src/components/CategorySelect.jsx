import { CATEGORIES } from "../constants";

export default function CategorySelect({ id, value, onChange }) {
  return (
    <select
      id={id}
      className="category-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {CATEGORIES.map((category) => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    </select>
  );
}
