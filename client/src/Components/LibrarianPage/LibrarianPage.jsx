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
      <Box id="librarianHeader">
        <Typography variant="h3">Librarian Dashboard</Typography>
        <Button onClick={() => handleClick("/")}>Return home</Button>
      </Box>

      <Box id="librarianAddButtons">
        <Box>
          <Button onClick={() => handleClick("/addBook")}> Add Book </Button>
          <Button onClick={() => handleClick("/addAuthor")}>
            Add Author
          </Button>

          <Button sx={{color: 'red'}} onClick={() => handleClick("/removeBooks")}>
            Remove Books or Authors
          </Button>
        </Box>

        <Box>
          <Button onClick={() => handleClick("/manageLibrarians")}> Manage Librarians </Button>
        </Box>
      </Box>

      <Box class="librarianSection">
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          Active Loans
        </Typography>
      </Box>

      <Box class="librarianSection">
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          Pending Loans
        </Typography>
      </Box>
    </Box>
  );
};

export default LibrarianPage;
