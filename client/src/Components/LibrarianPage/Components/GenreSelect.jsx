import * as React from "react";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const genres = [
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Thriller",
  "Romance",
  "History",
  "Technology",
  "Science",
  "Arts",
  "Other",
];

function getStyles(genre, selected, theme) {
  return {
    fontWeight: selected.includes(genre)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function GenreSelect({ onSelectChange }) {
  const theme = useTheme();
  const [selected, setSelected] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    const newValue = typeof value === "string" ? value.split(",") : value;

    setSelected(newValue);

    if (onSelectChange) {
      onSelectChange(newValue);
    }
  };

  return (
    <div>
      <FormControl size="small" sx={{ width: 300 }}>
        <InputLabel>Genre</InputLabel>
        <Select
          multiple
          value={selected}
          onChange={handleChange}
          input={<OutlinedInput label="Genre" />}
          MenuProps={MenuProps}
        >
          {genres.map((genre) => (
            <MenuItem
              key={genre}
              value={genre}
              style={getStyles(genre, selected, theme)}
            >
              {genre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
