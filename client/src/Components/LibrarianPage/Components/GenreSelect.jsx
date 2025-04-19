import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

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
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Thriller',
  'Romance',
  'History',
  'Technology',
  'Science',
  'Arts',
  'Other',
];

function getStyles(genre, selected, theme) {
  return {
    fontWeight: selected.includes(genre)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function MultipleSelect() {
  const theme = useTheme();
  const [genreName, setGenreName] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setGenreName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <FormControl size='small' sx={{width: 300 }}>
        <InputLabel>Genre</InputLabel>
        <Select
          multiple
          value={genreName}
          onChange={handleChange}
          input={<OutlinedInput label="Genre" />}
          MenuProps={MenuProps}
        >
          {genres.map((genre) => (
            <MenuItem
              key={genre}
              value={genre}
              style={getStyles(genre, genreName, theme)}
            >
              {genre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
