import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";

import "./AddAuthorStyles.css";
import { API_URL } from "../../utils/constants";

const AddAuthorPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleAddAuthor = async () => {
    try {
      const response = await fetch(`${API_URL}/author/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, biography }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setSuccess("Author added successfully");
      setError("");
    } catch (error) {
      setError("Could not add author successfully. Check fields and try again.");
      setSuccess("");
    }
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
        <TextField
          label="Author Name"
          variant="outlined"
          size="small"
          onChange={(event) => setName(event.target.value)}
        ></TextField>

        {/* Input Author Biography */}
        <TextField
          label="Biography"
          variant="outlined"
          size="small"
          onChange={(event) => setBiography(event.target.value)}
        ></TextField>
        {success && <p style={{ color: "green", textAlign: "center"}}>{success}</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <Box>
          <Button onClick={handleAddAuthor}>Add Author</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddAuthorPage;
