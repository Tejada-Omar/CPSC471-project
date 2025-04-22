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
} from "@mui/material";
import { API_URL } from "../../utils/constants";
import { Link } from "react-router-dom";

const AuthorPage = () => {
  const { authorId } = useParams();

  const [authorData, setAuthorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/author/${authorId}/book`);
      const data = await response.json();
      console.log(data);
      setAuthorData(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        {/* Author Profile Section */}
        <Stack spacing={2} alignItems="center">
          {/* Author Name */}
          <Typography variant="h4" gutterBottom>
            {authorData.author.name}
          </Typography>

          {/* Biography */}
          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            {authorData.author.biography}
          </Typography>

          <Divider sx={{ width: "100%", marginY: 2 }} />
        </Stack>

        {/* New Section for Books and Number of Copies */}
        <Stack spacing={2} alignItems="left" mt={4}>
          <Typography variant="h6" gutterBottom>
            Books Available:
          </Typography>
          {authorData.books && authorData.books.length > 0 ? (
            authorData.books.map((book) => (
              <Box
                key={`${book.id}-${book.authorId}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{ border: "1px solid #eee", borderRadius: 2 }}
              >
                <Box>
                  <Link
                    to={`/book/${book.id}/${book.authorId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{
                        "&:hover": {
                          color: "primary.main",
                          cursor: "pointer",
                        },
                      }}
                    >
                      {book.title}
                    </Typography>
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {book.synopsis
                      ? book.synopsis.slice(0, 100) + "..."
                      : "No synopsis available..."}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography>No books available.</Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AuthorPage;
