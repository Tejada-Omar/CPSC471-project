import { Button } from "@mui/material";

import { API_URL } from "../../../utils/constants";

const ApproveButton = ({ loan, authToken, fetchData }) => {
  const handleApproveLoan = async (authToken) => {
    try {
      const userResponse = confirm(
        `Approve this loan for ${loan.title}?`,
      );

      if (!userResponse) {
        return;
      }

      console.log("Approving loan with Loan ID:", loan.loan_id);

      // API call
      const response = await fetch(`${API_URL}/loan/${loan.loan_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          bookId: loan.book_id,
          authorId: loan.author_id,
          userId: loan.user_id
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve the loan request");
      }

      fetchData();

      // Successfully approve loan, update UI or show success
      alert(`Loan for ${loan.title} has been approved successfully!`);
    } catch (error) {
      alert("Failed to approve the loan request: " + error.message);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleApproveLoan(authToken)}
    >
      Approve Loan
    </Button>
  );
};

export default ApproveButton;
