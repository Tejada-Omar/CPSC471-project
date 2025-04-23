import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
} from "@mui/material";

import "./LibrarianStyles.css";
import { API_URL } from "../../utils/constants";

import PendingLoansList from "./Components/PendingLoansList";
import ActiveLoansList from "./Components/ActiveLoansList";

const LibrarianPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [isHeadLibrarian, setIsHeadLibrarian] = useState(false);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  useEffect(() => {
    const fetchIsHeadLibrarian = async () => {
      try {
        const response = await fetch(`${API_URL}/user/checkHeadLibrarian`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 200) {
          setIsHeadLibrarian(true);
        } else {
          setIsHeadLibrarian(false);
        }
      } catch (err) {
        console.error("Failed to fetch head librarian status", err);
        setIsHeadLibrarian(false);
      }
    };

    fetchIsHeadLibrarian();
  }, [authToken]);

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
          {isHeadLibrarian ? (
            <Button onClick={() => handleClick("/manageLibrarians")}>
              {" "}
              Manage Librarians{" "}
            </Button>
          ) : (
            <></>
          )}
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{ padding: 5, borderRadius: 2, boxShadow: 3, mt: 3, paddingTop: 1 }}
      >
        <ActiveLoansList title={"Active Loans"}></ActiveLoansList>

        <PendingLoansList title={"Pending Loans"}></PendingLoansList>
      </Paper>
    </Box>
  );
};

export default LibrarianPage;
