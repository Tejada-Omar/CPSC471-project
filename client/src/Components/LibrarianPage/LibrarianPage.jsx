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
import { API_URL } from "../../utils/constants";
import PendingLoansList from "./Components/PendingLoansList";

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
          <Button onClick={() => handleClick("/addAuthor")}>Add Author</Button>

          <Button
            sx={{ color: "red" }}
            onClick={() => handleClick("/removeBooks")}
          >
            Remove Books
          </Button>
        </Box>

        <Box>
          <Button onClick={() => handleClick("/manageLibrarians")}>
            {" "}
            Manage Librarians{" "}
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{ padding: 5, borderRadius: 2, boxShadow: 3, mt: 3, paddingTop: 1 }}
      >
        <Box class="librarianSection">
          <Typography variant="h5" sx={{ textDecoration: "underline" }}>
            Active Loans
          </Typography>
        </Box>

        <PendingLoansList title={"Pending Loans"}></PendingLoansList>
      </Paper>
    </Box>
  );
};

export default LibrarianPage;
