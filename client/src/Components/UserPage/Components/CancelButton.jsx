import { Button } from "@mui/material";

import { API_URL } from "../../../utils/constants";
import "../UserStyles.css";

const CancelButton = ({ loan, authToken, fetchData }) => {
  const handleCancelLoan = async (authToken) => {
    try {
      const userResponse = confirm(
        `Do you want to cancel your request for ${loan.book.title}?`,
      );
      console.log(loan);
      if (!userResponse) {
        return;
      }

      console.log("Cancelling loan request with Loan ID:", loan.loan.id);

      // API call
      const response = await fetch(`${API_URL}/loan/${loan.loan.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          bookId: loan.book.id,
          authorId: loan.book.authorId,
          approved: false,
        }),
      });

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to return the book");
      }

      fetchData();

      // Successfully returned book, update UI or show success
      alert(`Request for ${loan.book.title} has been cancelled successfully!`);
    } catch (error) {
      alert("Error cancelling the loan request: " + error.message);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleCancelLoan(authToken)}
    >
      Cancel Request
    </Button>
  );
};

export default CancelButton;
