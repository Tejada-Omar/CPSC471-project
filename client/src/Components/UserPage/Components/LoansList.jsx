import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { API_URL } from "../../../utils/constants";

import "../UserStyles.css";
import ReturnButton from "./ReturnButton";
import CancelButton from "./CancelButton";

const LoansList = ({ title, isApproved }) => {
  const authToken = localStorage.getItem("authToken");

  const [loanData, setLoanData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const loanResponse = await fetch(
        `${API_URL}/loan/user?approved=${isApproved}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const loanData = await loanResponse.json();
      setLoanData(loanData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check if a loan is overdue
  const isOverdue = (retDate) => {
    const today = new Date();
    return new Date(retDate) < today;
  };

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <Typography variant="h5" sx={{ textDecoration: "underline" }}>
        {title}
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

                {/* "Return Book" Button */}
                {isApproved ? (
                  <ReturnButton
                    loan={loan}
                    authToken={authToken}
                    fetchData={fetchData}
                  />
                ) : (
                  <CancelButton
                    loan={loan}
                    authToken={authToken}
                    fetchData={fetchData}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};

export default LoansList;
