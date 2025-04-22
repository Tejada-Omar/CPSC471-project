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

const LibraryPage = () => {
  const { libraryId } = useParams();

  const [libraryData, setLibraryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/library/${libraryId}/book`);
      const data = await response.json();
      console.log(data);
      setLibraryData(data);
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
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4" gutterBottom>
            {libraryData.library.name}
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            {libraryData.library.loc}
          </Typography>

          <Divider sx={{ width: "100%", marginY: 2 }} />
        </Stack>

        {/* New Section for Books and Number of Copies */}
        <Stack spacing={2} alignItems="left" mt={4}>
          <Typography variant="h6" gutterBottom>
            Books Available:
          </Typography>
          {libraryData.books && libraryData.books.length > 0 ? (
            libraryData.books.map((book) => (
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
                    Copies available: {book.noOfCopies}
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

export default LibraryPage;
