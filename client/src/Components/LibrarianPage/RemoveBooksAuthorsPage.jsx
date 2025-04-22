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

import "./RemoveBooksAuthorsStyles.css";
import { API_URL } from "../../utils/constants";

const RemoveBooksAuthorsPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [bookId, setBookId] = useState(0);
  const [bookAuthorId, setBookAuthorId] = useState(0);

  const [authorId, setAuthorId] = useState(0);

  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState("");

  const [authorError, setAuthorError] = useState("");
  const [authorSuccess, setAuthorSuccess] = useState("");

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

    const handleRemoveAuthor = async () => {
        try {
          const response = await fetch(`${API_URL}/author/${authorId}`, {
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
  
          setAuthorSuccess("Author deleted successfully");
          setAuthorError("");
        } catch (error) {
          setAuthorError("Could not delete author successfully. Check fields and try again. :" + error.message);
          setAuthorSuccess("");
        }
      };

  if (isLoadingBooks || isLoadingAuthors) {
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

        <Stack component="form" class="removeBooksAuthorsForm" spacing={4}>
          {authorSuccess && (
          <p style={{ color: "green", textAlign: "center" }}>{authorSuccess}</p>
        )}
        {authorError && <p style={{ color: "red", textAlign: "center" }}>{authorError}</p>}
          <Stack spacing={4}>
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
            <Button sx={{ color: "red" }} onClick={handleRemoveAuthor}>Remove Author</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default RemoveBooksAuthorsPage;
