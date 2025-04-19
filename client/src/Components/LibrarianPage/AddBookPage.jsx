import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";

import "./AddBookStyles.css";
import GenreSelect from "./Components/GenreSelect";

const AddBookPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="addBookBox">
      <Box id="addBookHeader">
        <Typography variant="h3">Add Book</Typography>
        <Button onClick={() => handleClick("/librarian")}>
          Back to dashboard
        </Button>
      </Box>

      <Stack component="form" id="addBookForm" spacing={4}>

        {/* Select Library */}
        <FormControl size="small">
          <InputLabel>Library</InputLabel>
          <Select label="Author">
            <MenuItem value="University of Calgary Digital Library">
              University of Calgary Digital Library
            </MenuItem>
          </Select>
        </FormControl>

        {/* Input Title */}
        <TextField label="Title" variant="outlined" size="small"></TextField>

        {/*  Select Author */}
        <FormControl size="small">
          <InputLabel>Author</InputLabel>
          <Select label="Author">
            <MenuItem value="Winston">Winston</MenuItem>
          </Select>
        </FormControl>

        {/* Input Synopsis */}
        <TextField label="Synopsis" variant="outlined" size="small"></TextField>
        
        {/* Input Publishing Date */}
        <TextField
          label="Publishing Date"
          variant="outlined"
          size="small"
        ></TextField>

        {/* Input Genres */}
        <GenreSelect></GenreSelect>

        <Box>
          <Button>Add Book</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddBookPage;
