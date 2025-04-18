import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import SearchBar from "../SearchBar";

import "./HomeStyles.css";
const HomePage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <>
      <Stack id="homeStack" spacing={2}>
        <Box id="homeHeaderBox">
          <Typography variant="h2">OneShelf</Typography>
          <Box id="homeButtonBox">
            <Button onClick={() => handleClick("/librarian")}> Librarian Dashboard </Button>
            <Button onClick={() => handleClick("/admin")}> Admin Dashboard </Button>
            <Button onClick={() => handleClick("/login")}> Login </Button>
          </Box>
        </Box>

        <SearchBar placeholder="Search for books..."></SearchBar>
      </Stack>
    </>
  );
};

export default HomePage;
