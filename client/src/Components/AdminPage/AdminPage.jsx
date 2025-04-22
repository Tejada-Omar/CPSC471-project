import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography, Paper } from "@mui/material";

import "./AdminStyles.css";
import UsersList from "./Components/UsersList";

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
        <Button onClick={() => handleClick("/addLibrary")}>
          {" "}
          Add Library{" "}
        </Button>
        <Button onClick={() => handleClick("/appointLibrarian")}>
          {" "}
          Appoint Librarian{" "}
        </Button>
      </Box>

      <Paper
        elevation={3}
        sx={{ padding: 5, borderRadius: 2, boxShadow: 3, mt: 3, paddingTop: 1 }}
      >
        <UsersList title={"Users"}></UsersList>

        <Box class="adminSection">
          <Typography variant="h5" sx={{ textDecoration: "underline" }}>
            Reviews
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
};

export default AdminPage;
