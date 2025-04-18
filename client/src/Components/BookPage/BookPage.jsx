import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";

import "./BookStyles.css";

const BookPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="bookBox">
      Book Page
    </Box>
  );
};

export default BookPage;
