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
} from "@mui/material";
import { API_URL } from "../../utils/constants";

const AuthorPage = () => {
  const { authorId } = useParams();

  const [authorData, setAuthorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
};

export default AuthorPage;
