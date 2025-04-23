import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import "./RemoveAuthorsStyles.css";
import { API_URL } from "../../utils/constants";

const RemoveAuthorsPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [authors, setAuthors] = useState([]);

  const [selectedAuthor, setSelectedAuthor] = useState(0);

  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

  const [authorError, setAuthorError] = useState("");
  const [authorSuccess, setAuthorSuccess] = useState("");

  const fetchAuthors = async () => {
    try {
      const response = await fetch(`${API_URL}/author/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();

      setAuthors(data);
    } catch (err) {
      console.error("Failed to fetch authors:", err);
    } finally {
      setIsLoadingAuthors(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleRemoveAuthor = async () => {
    setAuthorError("");
    setAuthorSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/author/${selectedAuthor}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setAuthorSuccess("Author deleted successfully");
      setAuthorError("");

      fetchAuthors();
    } catch (error) {
      setAuthorError(
        "Could not delete author successfully. Check fields and try again. :" +
          error.message
      );
      setAuthorSuccess("");
    }
  };

  if (isLoadingAuthors) {
    return <>loading...</>;
  }

  return (
    <Box id="removeAuthorsBox">
      <Box id="removeAuthorsHeader">
        <Typography variant="h3">Remove Authors</Typography>
        <Button onClick={() => handleClick("/admin")}>
          Back to dashboard
        </Button>
      </Box>

      <Box id="removeAuthorsBody">
        <Stack component="form" class="removeAuthorsForm" spacing={4}>
          {authorSuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{authorSuccess}</p>
          )}
          {authorError && (
            <p style={{ color: "red", textAlign: "center" }}>{authorError}</p>
          )}
          <Stack spacing={4}>
            {/*  Select Author */}
            <FormControl size="small">
              <InputLabel>Author</InputLabel>
              <Select
                label="Author"
                onChange={(event) => setSelectedAuthor(event.target.value)}
              >
                {authors.map((author) => (
                  <MenuItem key={author.id} value={author.id}>
                    {author.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button sx={{ color: "red" }} onClick={handleRemoveAuthor}>
              Remove Author
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default RemoveAuthorsPage;
