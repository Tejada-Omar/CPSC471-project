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

import "./RemoveBooksStyles.css";
import { API_URL } from "../../utils/constants";

const RemoveBooksPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [books, setBooks] = useState([]);

  const [bookId, setBookId] = useState(0);
  const [authorId, setAuthorId] = useState(0);

  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/book`);
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setIsLoadingBooks(false); // Set loading to false when done
      }
    };

    fetchBooks();
  }, []);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

    const handleRemoveBook = async () => {
      try {
        const response = await fetch(`${API_URL}/book/${bookId}?authorId=${authorId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // If the response is not successful, show an error
          throw new Error(data.error || "An unexpected error occurred");
        }

        setBookSuccess("Book deleted successfully");
        setBookError("");
      } catch (error) {
        setBookError("Could not delete book successfully. Check fields and try again. :" + error.message);
        setBookSuccess("");
      }
    };

  if (isLoadingBooks) {
    return <>loading...</>;
  }

  return (
    <Box id="removeBooksAuthorsBox">
      <Box id="removeBooksAuthorsHeader">
        <Typography variant="h3">Remove Books or Authors</Typography>
        <Button onClick={() => handleClick("/librarian")}>
          Back to dashboard
        </Button>
      </Box>

      <Box id="removeBooksAuthorsBody">
        <Stack component="form" class="removeBooksAuthorsForm" spacing={4}>
          {bookSuccess && (
          <p style={{ color: "green", textAlign: "center" }}>{bookSuccess}</p>
        )}
        {bookError && <p style={{ color: "red", textAlign: "center" }}>{bookError}</p>}
          <Stack spacing={4}>
            {/*  Select Book */}
            <FormControl size="small">
              <InputLabel>Book</InputLabel>
              <Select
                label="Book"
                onChange={(event) => setBookId(Number(event.target.value[0]), setAuthorId(Number(event.target.value[1])))}
              >
                {books.map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    {book.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button sx={{ color: "red" }} onClick={handleRemoveBook}>Remove Book</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default RemoveBooksPage;
