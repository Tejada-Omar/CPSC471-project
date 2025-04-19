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

import "./AddAuthorStyles.css";

const AddAuthorPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="addAuthorBox">
      <Box id="addAuthorHeader">
        <Typography variant="h3">Add Author</Typography>
        <Button onClick={() => handleClick("/librarian")}>
          Back to dashboard
        </Button>
      </Box>

      <Stack component="form" id="addAuthorForm" spacing={4}>
        {/* Input Author Name */}
        <TextField label="Author Name" variant="outlined" size="small"></TextField>

        {/* Input Author Biography */}
        <TextField label="Biography" variant="outlined" size="small"></TextField>
        <Box>
          <Button>Add Author</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddAuthorPage;
