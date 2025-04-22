import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { API_URL } from "../../utils/constants";

import "./UserStyles.css";

const UserPage = () => {
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const [loanData, setLoanData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/loan/user?required={true}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      console.log(data);

      setLoanData(data);
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

  // Check if a loan is overdue
  const isOverdue = (retDate) => {
    const today = new Date();
    return new Date(retDate) < today;
  };

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <Box id="userBox">
      <Box id="userHeader">
        <Typography variant="h3">Hello user!</Typography>
        <Button onClick={() => handleClick("/")}>Return home</Button>
      </Box>

      <Paper
        elevation={3}
        sx={{ padding: 5, borderRadius: 2, boxShadow: 3, mt: 3 }}
      >
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          My Loans
        </Typography>

        {/* Generate a card for each loan */}
        {loanData.map((loan, index) => {
          const overdue = isOverdue(loan.loan.retDate); // Check if the loan is overdue

          return (
            <Card
              key={loan.loan.id}
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: overdue ? "#ffe6e6" : "white", // Slightly red tint for overdue loans
                border: overdue ? "1px solid red" : "1px solid grey",
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Loan ID: {loan.loan.id}</Typography>
                  <Typography variant="h6">
                    Book Title: {loan.book.title}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Synopsis:</strong> {loan.book.synopsis}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Loan Start Date:</strong>{" "}
                    {new Date(loan.loan.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Return Date:</strong>{" "}
                    {new Date(loan.loan.retDate).toLocaleDateString()}
                  </Typography>
                  {overdue && (
                    <Typography
                      variant="body2"
                      color="red"
                      sx={{ fontStyle: "italic" }}
                    >
                      This loan is overdue!
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Paper>
    </Box>
  );
};

export default UserPage;
