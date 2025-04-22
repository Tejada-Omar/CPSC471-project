import { useEffect, useState } from "react";
import { Stack, Typography, Card, CardContent, Box } from "@mui/material";
import { API_URL } from "../../../utils/constants";

import ApproveButton from "./ApproveButton";

const PendingLoansList = ({ title }) => {
  const authToken = localStorage.getItem("authToken");

  const [loanData, setLoanData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const loanResponse = await fetch(`${API_URL}/loan/availBooks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

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
      <Box mt={5}>
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          {title}
        </Typography>

        {console.log(loanData)}
        {/* Generate a card for each loan */}
        {loanData.map((loan, index) => {
          const overdue = isOverdue(loan.ret_date); // Check if the loan is overdue

          return (
            <Card
              key={loan.loan_id}
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
                  <Typography variant="h6">Loan ID: {loan.loan_id}</Typography>
                  <Typography variant="h6">User ID: {loan.user_id}</Typography>
                  <Typography variant="h6">
                    Book Title: {loan.title}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Synopsis:</strong> {loan.synopsis}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Loan Start Date:</strong>{" "}
                    {new Date(loan.start_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Return Date:</strong>{" "}
                    {new Date(loan.ret_date).toLocaleDateString()}
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

                  <ApproveButton
                    loan={loan}
                    authToken={authToken}
                    fetchData={fetchData}
                  />
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
};

export default PendingLoansList;
