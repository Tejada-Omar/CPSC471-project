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
import { API_URL } from "../../utils/constants";

const AddLibraryPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleAddLibrary = async () => {
    try {
      const response = await fetch(`${API_URL}/library/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, loc }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setSuccess("Library added successfully");
      setError("");
    } catch (error) {
      setError(
        "Could not add library successfully. Check fields and try again."
      );
      setSuccess("");
    }
  };

  return (
    <Box id="addLibraryBox">
      <Box id="addLibraryHeader">
        <Typography variant="h3">Add Library</Typography>
        <Button onClick={() => handleClick("/admin")}>Back to dashboard</Button>
      </Box>

      <Stack component="form" id="addLibraryForm" spacing={4}>
        {/* Input Library Name */}
        <TextField
          label="Library Name"
          variant="outlined"
          size="small"
          onChange={(event) => setName(event.target.value)}
        ></TextField>

        {/* Input Library Location */}
        <TextField
          label="Location"
          variant="outlined"
          size="small"
          onChange={(event) => setLoc(event.target.value)}
        ></TextField>
        {success && <p style={{ color: "green", textAlign: "center"}}>{success}</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <Box>
          <Button onClick={handleAddLibrary}>Add Library</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddLibraryPage;
