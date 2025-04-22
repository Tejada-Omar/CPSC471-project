import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchBar from "../SearchBar";
import { API_URL } from "../../utils/constants";

import "./HomeStyles.css";

const HomePage = () => {
  const authToken = localStorage.getItem("authToken");

  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLibrarian, setIsLibrarian] = useState(false);
  const [searchField, setSearchField] = useState("title");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/book`);
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchIsAdmin = async () => {
      try {
        const response = await fetch(`${API_URL}/user/checkAdmin`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 200) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Failed to fetch admin status", err);
        setIsAdmin(false);
      }
    };

    fetchIsAdmin();
  }, [authToken]);

  useEffect(() => {
    const fetchIsLibrarian = async () => {
      try {
        const response = await fetch(`${API_URL}/user/checkLibrarian`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 200) {
          setIsLibrarian(true);
        } else {
          setIsLibrarian(false);
        }
      } catch (err) {
        console.error("Failed to fetch librarian status", err);
        setIsLibrarian(false);
      }
    };

    fetchIsLibrarian();
  }, [authToken]);

  const handleClick = (url) => {
    navigate(url);
  };

  const handleBookClick = (book_id, author_id) => {
    navigate(`/book/${book_id}/${author_id}`);
  };

  const filteredBooks = books.filter((book) => {
    const query = searchQuery.toLowerCase();

    if (searchField === "title") {
      return book.title.toLowerCase().includes(query);
    }

    if (searchField === "authorName") {
      return book.authorName?.toLowerCase().includes(query);
    }

    if (searchField === "genres") {
      return book.genres?.some((genre) =>
        genre ? genre.toLowerCase().includes(query) : null
      );
    }

    if (searchField === "synopsis") {
      return book.synopsis.toLowerCase().includes(query);
    }

    return false;
  });

  const mapSearchToValue = (searchField) => {
    if (searchField === "authorName") {
      return "author";
    } else if (searchField === "genres") {
      return "genre";
    } else if (searchField === "title" || searchField === "synopsis") {
      return searchField;
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    location.reload();
  };

  if (isLoading) {
    return <>loading...</>;
  }

  return (
    <Stack id="homeStack" spacing={2}>
      <Box id="homeHeaderBox">
        <Typography variant="h2">OneShelf</Typography>
        <Box id="homeButtonBox">
          {authToken && isAdmin ? (
            <Button onClick={() => handleClick("/admin")}>
              Admin Dashboard
            </Button>
          ) : (
            <></>
          )}

          {authToken && isLibrarian ? (
            <Button onClick={() => handleClick("/librarian")}>
              Librarian Dashboard
            </Button>
          ) : (
            <></>
          )}

          {authToken ? (
            <Button onClick={() => handleClick("/user")}>User Dashboard</Button>
          ) : (
            <></>
          )}

          {authToken ? (
            <Button onClick={handleSignOut}>Sign out</Button>
          ) : (
            <Button onClick={() => handleClick("/login")}>Login</Button>
          )}
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        justifyContent="center"
        flexWrap="wrap"
      >
        <SearchBar
          onSearchChange={setSearchQuery}
          placeholder={`Search by ${mapSearchToValue(searchField)}...`}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="search-field-label">Search By</InputLabel>
          <Select
            labelId="search-field-label"
            id="search-field"
            value={searchField}
            label="Search By"
            onChange={(e) => setSearchField(e.target.value)}
          >
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="authorName">Author</MenuItem>
            <MenuItem value="genres">Genre</MenuItem>
            <MenuItem value="synopsis">Synopsis</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        {filteredBooks.map((book) => (
          <Card
            key={`${book.id}-${book.authorId}`}
            sx={{ width: 300, cursor: "pointer" }}
            id="bookCard"
            onClick={() => handleBookClick(book.id, book.authorId)}
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
