import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({ noMargin = false, onSearchChange, placeholder="" }) {
  return (
    <TextField
      variant="outlined"
      placeholder={placeholder}
      size="small"
      onChange={(event) => onSearchChange(event.target.value)}
      sx={{
        flexGrow: 1, // Ensures the search bar takes available space
        marginLeft: noMargin ? 0 : "16px",
        marginRight: noMargin ? 0 : "16px",
        minWidth: "150px",
        backgroundColor: "white",
        borderRadius: "4px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          "&:hover": {
            borderColor: "black",
          },
          "&.Mui-focused fieldset": {
            borderColor: "black",
          },
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
