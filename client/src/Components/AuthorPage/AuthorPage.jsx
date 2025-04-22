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
  Button,
  Avatar,
} from "@mui/material";
import { API_URL } from "../../utils/constants";

const AuthorPage = () => {
  const { authorId } = useParams();

  const [authorData, setAuthorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/author/${authorId}`);
      const data = await response.json();
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
          {/* Avatar or Profile Image */}
          <Avatar
            sx={{
              width: 120,
              height: 120,
              marginBottom: 2,
              border: "4px solid #ddd",
            }}
            src="/path-to-author-image.jpg" // Replace with actual image URL if available
            alt={authorData.name}
          />

          {/* Author Name */}
          <Typography variant="h4" gutterBottom>
            {authorData.name}
          </Typography>

          {/* Biography */}
          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            {authorData.biography}
          </Typography>

          <Divider sx={{ width: "100%", marginY: 2 }} />
        </Stack>
      </Paper>
    </Box>
  );
};

export default AuthorPage;
