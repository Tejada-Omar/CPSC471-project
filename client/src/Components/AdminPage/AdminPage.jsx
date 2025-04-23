import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
} from "@mui/material";

import "./AdminStyles.css";
import UsersList from "./Components/UsersList";
import ReviewsList from "./Components/ReviewsList";

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

      <Box id="adminButtons">
        <Button onClick={() => handleClick("/addLibrary")}>
          {" "}
          Add Library{" "}
        </Button>
        <Button onClick={() => handleClick("/appointLibrarian")}>
          {" "}
          Appoint Librarian{" "}
        </Button>

        <Button
          sx={{ color: "red" }}
          onClick={() => handleClick("/removeLibrarys")}
        >
          Remove Library
        </Button>
        <Button
          sx={{ color: "red" }}
          onClick={() => handleClick("/removeAuthors")}
        >
          Remove Authors
        </Button>
      </Box>

      <Paper
        elevation={3}
        sx={{ padding: 5, borderRadius: 2, boxShadow: 3, mt: 3, paddingTop: 1 }}
      >
        <UsersList title={"Users"}></UsersList>

        <ReviewsList title="Reviews"></ReviewsList>
      </Paper>
    </Box>
  );
};

export default AdminPage;
