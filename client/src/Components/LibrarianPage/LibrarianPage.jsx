import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";

import "./LibrarianStyles.css";

const LibrarianPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="librarianBox">
      Librarian Page
    </Box>
  );
};

export default LibrarianPage;
