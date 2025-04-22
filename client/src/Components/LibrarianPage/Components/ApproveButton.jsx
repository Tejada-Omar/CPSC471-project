import { Button } from "@mui/material";

import { API_URL } from "../../../utils/constants";

const ReturnButton = ({ loan, authToken, fetchData }) => {
  const handleReturnBook = async (authToken) => {
    try {
      const userResponse = confirm(
        `Do you want to return book ${loan.book.title}?`,
      );
      console.log(loan);
      if (!userResponse) {
        return;
      }

      console.log("Returning book with Loan ID:", loan.loan.id);

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
          approved: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to return the book");
      }

      fetchData();

      // Successfully returned book, update UI or show success
      alert(`Book ${loan.book.title} has been returned successfully!`);
    } catch (error) {
      alert("Error returning the book: " + error.message);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleReturnBook(authToken)}
    >
      Approve Loan
    </Button>
  );
};

export default ReturnButton;
