import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper } from "@mui/material";
import { API_URL } from "../../utils/constants";

import "./UserStyles.css";
import LoansList from "./Components/LoansList";

const UserPage = () => {
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({});

  const fetchData = async () => {
    try {
      const userResponse = await fetch(`${API_URL}/user/ownUser`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const userDataTemp = await userResponse.json();

      setUserData(userDataTemp);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchData();
    //setLoanData(mockLoanData);
  }, []);

  // Array of loan data for testing
  /* const mockLoanData = [
    {
      loan: {
        id: 3,
        userId: 4,
        retDate: "2026-05-14T00:00:00.000Z",
        startDate: "2024-05-01T00:00:00.000Z",
        librarianId: 1,
      },
      book: {
        id: 1,
        authorId: 1,
        publishedDate: "1997-06-26T06:00:00.000Z",
        synopsis:
          "A young boy discovers he is a wizard and attends Hogwarts School of Witchcraft and Wizardry.",
        title: "Harry Potter and the Philosopher's Stone",
      },
    },
    {
      loan: {
        id: 4,
        userId: 4,
        retDate: "2024-04-01T00:00:00.000Z", // Overdue loan example
        startDate: "2024-03-15T00:00:00.000Z",
        librarianId: 2,
      },
      book: {
        id: 2,
        authorId: 2,
        publishedDate: "2005-08-10T00:00:00.000Z",
        synopsis:
          "A detective solving complex cases while confronting his own troubled past.",
        title: "The Silent Witness",
      },
    },
  ]; */

  const handleClick = (url) => {
    navigate(url);
  };

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <Box id="userBox">
      <Box id="userHeader">
        <Typography variant="h3">Hello {userData.uname}!</Typography>
        <Button onClick={() => handleClick("/")}>Return home</Button>
      </Box>

      <Paper
        elevation={3}
        sx={{ padding: 5, borderRadius: 2, boxShadow: 3, mt: 3 }}
      >
        <LoansList title={"My Current Loans"} isApproved={true} />
        <LoansList title={"My Requested Loans"} isApproved={false} />
      </Paper>
    </Box>
  );
};

export default UserPage;
