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
import { API_URL } from "../../utils/constants";

const BookPage = () => {
  const authToken = localStorage.getItem("authToken");

  const { bookId, authorId } = useParams();
  const [book, setBook] = useState({});
  const [reviewData, setReviewData] = useState([]);
  const [libraryData, setLibraryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/book/${bookId}?authorId=${authorId}`
        );
        const data = await response.json();
        setBook(data[0]);

        const reviewResponse = await fetch(
          `${API_URL}/review?bookId=${bookId}&authorId=${authorId}`
        );
        const reviewDataTemp = await reviewResponse.json();
        setReviewData(reviewDataTemp);

        const libraryResponse = await fetch(
          `${API_URL}/library/booklibs?bookId=${bookId}&authorId=${authorId}`
        );
        const libraryDataTemp = await libraryResponse.json();
        setLibraryData(libraryDataTemp);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    };

    fetchData();
  }, []);

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
    reviewData.reduce((sum, review) => sum + review.rating, 0) /
    reviewData.length;

  if (isLoading) {
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
        ></Paper>
      </Box>
    );
  }

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
              {book.author}
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
              Publication Date: {book.pdate}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6">Synopsis</Typography>
            <Typography variant="body1" mt={1}>
              {book.synopsis}
            </Typography>
          </Box>

          {/* Genres Section */}
          <Box>
            <Typography variant="h6">Genres</Typography>
            <Stack direction="row" spacing={2} mt={1} mb={4} flexWrap="wrap">
              {book.genres.map((genre, index) => (
                <Typography
                  key={index}
                  sx={{
                    fontWeight: "bold",
                    position: "relative",
                    display: "inline-block",
                    pb: "4px",
                    cursor: "default",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: "100%",
                      height: "3px",
                      backgroundColor: "#90caf9", // Light blue underline
                      borderRadius: "2px",
                    },
                  }}
                >
                  {genre}
                </Typography>
              ))}
            </Stack>
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
                    <Typography variant="subtitle1">
                      {library.library_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Copies available: {library.no_of_copies}
                    </Typography>
                  </Box>
                  {library.no_of_copies > 0 && authToken && (
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
            {authToken ? (
              <Box display="flex" justifyContent="flex-end" mb={1}>
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    // Placeholder action
                    alert(
                      "Redirect to review form, this button should prob only be visible to logged in users as well."
                    );
                  }}
                >
                  Leave a Review
                </button>
              </Box>
            ) : (
              <></>
            )}

            <Stack spacing={3}>
              {reviewData.map((review) => (
                <Box
                  key={`${review.review_id}-${review.reviewer}`}
                  p={2}
                  sx={{ border: "1px solid #eee", borderRadius: 2 }}
                >
                  <Rating value={review.rating} readOnly />
                  <Typography variant="body1" mt={1}>
                    {review.body}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    — User {review.reviewer}
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
