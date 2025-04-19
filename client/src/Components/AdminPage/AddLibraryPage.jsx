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

import "./AddLibraryStyles.css";

const AddLibraryPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="addLibraryBox">
      <Box id="addLibraryHeader">
        <Typography variant="h3">Add Library</Typography>
        <Button onClick={() => handleClick("/admin")}>
          Back to dashboard
        </Button>
      </Box>

      <Stack component="form" id="addLibraryForm" spacing={4}>
        {/* Input Library Name */}
        <TextField label="Library Name" variant="outlined" size="small"></TextField>

        {/* Input Library Location */}
        <TextField label="Location" variant="outlined" size="small"></TextField>
        <Box>
          <Button>Add Library</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddLibraryPage;
