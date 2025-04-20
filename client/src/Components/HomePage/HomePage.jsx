import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import SearchBar from "../SearchBar";
import { API_URL } from "../../utils/constants";

import "./HomeStyles.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/book`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Failed to fetch books:", err));
  }, []);

  const handleClick = (url) => {
    navigate(url);
  };

  const handleBookClick = (book_id, author_id) => {
    navigate(`/book/${book_id}/${author_id}`);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.synopsis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack id="homeStack" spacing={2}>
      <Box id="homeHeaderBox">
        <Typography variant="h2">OneShelf</Typography>
        <Box id="homeButtonBox">
          <Button onClick={() => handleClick("/librarian")}>
            Librarian Dashboard
          </Button>
          <Button onClick={() => handleClick("/admin")}>Admin Dashboard</Button>
          <Button onClick={() => handleClick("/login")}>Login</Button>
        </Box>
      </Box>

      <SearchBar
        onSearchChange={setSearchQuery}
        placeholder="Search for books..."
      />

      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        {filteredBooks.map((book) => (
          <Card
            key={`${book.book_id}-${book.author_id}`}
            sx={{ width: 300, cursor: "pointer" }}
            id="bookCard"
            onClick={() => handleBookClick(book.book_id, book.author_id)}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {book.synopsis
                  ? book.synopsis.slice(0, 100) + "..."
                  : "No synopsis available..."}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
};

export default HomePage;
