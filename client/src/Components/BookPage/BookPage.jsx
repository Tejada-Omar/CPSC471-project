import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Rating,
} from "@mui/material";

import "./BookStyles.css";

const BookPage = () => {
  const { bookId, authorId } = useParams();
  const [book, setBook] = useState({});
  const [reviewData, setReviewData] = useState([]);
  const [libraryData, setLibraryData] = useState([]);

  useEffect(() => {
    /* fetch(`${API_URL}/<something>`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch((err) => console.error("Failed to fetch books:", err)); */
    setBook(mockBook);
    setReviewData(mockReviewData);
    setLibraryData(mockLibraries);
  }, []);

  const mockBook = {
    book_id: 1,
    author_id: 1,
    author_name: "J. K. Rowling",
    pdate: "1997-06-26",
    title: "Harry Potter and the Philosopher's Stone",
    synopsis:
      "A young boy discovers he is a wizard and attends Hogwarts School of Witchcraft and Wizardry.",
  };

  const mockReviewData = [
    {
      review_id: 1,
      user_id: 1,
      rating: 5,
      body: "An amazing book that captivates the reader from the start.",
      book_id: 1,
      author_id: 1,
    },
    {
      review_id: 2,
      user_id: 2,
      rating: 4,
      body: "A magical and imaginative story. Some parts felt a bit slow, but overall a great read.",
      book_id: 1,
      author_id: 1,
    },
    {
      review_id: 3,
      user_id: 3,
      rating: 5,
      body: "Loved the characters and the world-building. This book made me want to read the whole series!",
      book_id: 1,
      author_id: 1,
    },
    {
      review_id: 4,
      user_id: 1,
      rating: 3,
      body: "I liked the story, but it felt a bit too childish for my taste.",
      book_id: 1,
      author_id: 1,
    },
    {
      review_id: 5,
      user_id: 2,
      rating: 4,
      body: "A strong start to a legendary series. Hogwarts is such a fascinating place.",
      book_id: 1,
      author_id: 1,
    },
    {
      review_id: 6,
      user_id: 3,
      rating: 5,
      body: "Absolutely magical! I couldn't put it down.",
      book_id: 1,
      author_id: 1,
    },
  ];

  const mockLibraries = [
    { library_id: 101, name: "Downtown Public Library", copies: 3 },
    { library_id: 102, name: "Northside Community Library", copies: 0 },
    { library_id: 103, name: "University Library", copies: 5 },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLoanRequest = (libraryId) => {
    const userResponse = confirm(
      `Do you want to request a loan for ${book.title} by ${book.author_name} from ${libraryId}?`
    );
    if (userResponse) {
      alert("create loan request");
    }
  };

  const averageRating =
    mockReviewData.reduce((sum, review) => sum + review.rating, 0) /
    mockReviewData.length;

  return (
    <Box
      display="flex"
      justifyContent="center"
      px={2}
      py={4}
      sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: isMobile ? 2 : 4,
          width: isMobile ? "100%" : "60%",
          maxWidth: "800px",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={0}>
            <Typography variant="h4" component="h1">
              {book.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {book.author_name}
            </Typography>
          </Stack>

          {/* Average Rating */}
          <Box display="flex" alignItems="center">
            <Rating value={averageRating} precision={0.1} readOnly />
            <Typography ml={1} variant="subtitle1" color="text.secondary">
              {averageRating.toFixed(1)} / 5
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" color="text.secondary">
              Book ID: {book.book_id}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Author ID: {book.author_id}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Publication Date: {book.pdate}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6">Synopsis</Typography>
            <Typography variant="body1" mt={1} mb={8}>
              {book.synopsis}
            </Typography>
          </Box>

          <Divider />

          {/* Libraries Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Libraries
            </Typography>
            <Stack spacing={2}>
              {libraryData.map((library) => (
                <Box
                  key={library.library_id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  sx={{ border: "1px solid #eee", borderRadius: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle1">{library.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Copies available: {library.copies}
                    </Typography>
                  </Box>
                  {library.copies > 0 && (
                    <button
                      onClick={() => handleLoanRequest(library.name)}
                      style={{
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Request Loan
                    </button>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Reviews Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            <Stack spacing={3}>
              {reviewData.map((review) => (
                <Box
                  key={review.review_id}
                  p={2}
                  sx={{ border: "1px solid #eee", borderRadius: 2 }}
                >
                  <Rating value={review.rating} readOnly />
                  <Typography variant="body1" mt={1}>
                    {review.body}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    — User #{review.user_id}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BookPage;
