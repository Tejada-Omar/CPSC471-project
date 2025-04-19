import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";

import "./AdminStyles.css";

const AdminPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="adminBox">
      <Box id="adminHeader">
        <Typography variant="h3">Admin Dashboard</Typography>
        <Button onClick={() => handleClick("/")}>Return home</Button>
      </Box>

      <Box id="librarianButtons">
        <Button onClick={() => handleClick("/addLibrary")}> Add Library </Button>
        <Button onClick={() => handleClick("/appointLibrarian")}> Appoint Librarian </Button>
      </Box>

      <Box class="adminSection">
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          Users
        </Typography>
      </Box>

      <Box class="adminSection">
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          Reviews
        </Typography>
      </Box>

      <Box class="adminSection">
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          Librarians
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminPage;
