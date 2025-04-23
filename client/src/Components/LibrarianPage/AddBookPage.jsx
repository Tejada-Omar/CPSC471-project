import { useState, useEffect } from "react";
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
import { API_URL } from "../../utils/constants";
import GenreSelect from "./Components/GenreSelect";

const AddBookPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [authors, setAuthors] = useState([]);

  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState(0);
  const [synopsis, setSynopsis] = useState("");
  const [publishingDate, setPublishingDate] = useState();
  const [genres, setGenres] = useState([]);
  const [noOfCopies, setNoOfCopies] = useState(1);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`${API_URL}/author`);
        const data = await response.json();
        setAuthors(data);
      } catch (err) {
        console.error("Failed to fetch authors:", err);
      } finally {
        setIsLoadingAuthors(false); // Set loading to false when done
      }
    };

    fetchAuthors();
  }, []);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleAddBook = async () => {
    try {
      const response = await fetch(`${API_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ authorId, title, genre: genres, publishedDate: publishingDate, synopsis, noOfCopies }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setSuccess("Book added successfully");
      setError("");
    } catch (error) {
      setError(
        "Could not add book successfully. Check fields and try again. :" + error.message
      );
      setSuccess("");
    }
  };

  if (isLoadingAuthors) {
    return <>loading...</>;
  }

  return (
    <Box id="addBookBox">
      <Box id="addBookHeader">
        <Typography variant="h3">Add Book</Typography>
        <Button onClick={() => handleClick("/librarian")}>
          Back to dashboard
        </Button>
      </Box>

      <Stack component="form" id="addBookForm" spacing={4}>
        {/* Input Title */}
        <TextField
          label="Title"
          variant="outlined"
          size="small"
          onChange={(event) => setTitle(event.target.value)}
        ></TextField>

        {/*  Select Author */}
        <FormControl size="small">
          <InputLabel>Author</InputLabel>
          <Select
            label="Author"
            onChange={(event) => setAuthorId(Number(event.target.value))}
          >
            {authors.map((author) => (
              <MenuItem key={author.id} value={author.id}>
                {author.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Input Synopsis */}
        <TextField
          label="Synopsis"
          variant="outlined"
          size="small"
          onChange={(event) => setSynopsis(event.target.value)}
        ></TextField>

        {/* Input Publishing Date */}
        <TextField
          label="Publishing Date"
          variant="outlined"
          size="small"
          type="date"
          onChange={(event) => setPublishingDate(event.target.value)}
          InputLabelProps={{
            shrink: true, // ensures the label stays visible when date is selected
          }}
        ></TextField>

        {/* Input Genres */}
        <GenreSelect onSelectChange={setGenres}></GenreSelect>

        {/* No. Copies */}
        <TextField
          label="Copies"
          variant="outlined"
          size="small"
          type="number"
          value={noOfCopies}
          onChange={(event) => setNoOfCopies(Math.max(Number(event.target.value), 1))}
        ></TextField>
        {success && (
          <p style={{ color: "green", textAlign: "center" }}>{success}</p>
        )}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <Box>
          <Button onClick={handleAddBook}>Add Book</Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AddBookPage;
