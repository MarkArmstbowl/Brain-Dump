import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { CATEGORIES } from "../constants";

export default function CategorySelect({ id, value, onChange, label, size = "small" }) {
  const labelId = `${id}-label`;
  return (
    <FormControl fullWidth size={size} sx={{ minWidth: 120 }}>
      <InputLabel id={labelId}>{label ?? "Category"}</InputLabel>
      <Select
        id={id}
        labelId={labelId}
        value={value}
        label={label ?? "Category"}
        onChange={(event) => onChange(event.target.value)}
        MenuProps={{ disableScrollLock: true }}
      >
        {CATEGORIES.map((category) => (
          <MenuItem key={category.value} value={category.value}>
            {category.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
