import { Button } from "@mui/material";

import { API_URL } from "../../../utils/constants";

const RemoveReviewButton = ({ review, authToken, fetchData }) => {
  const handleRemoveReview = async (authToken) => {
    try {
      const userResponse = confirm(
        `Remove this review with id ${review.review_id}?`,
      );
      console.log(review);
      if (!userResponse) {
        return;
      }

      console.log("Deleting review with Review ID:", review.review_id);

      // API call
      const response = await fetch(`${API_URL}/review/${review.review_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete the review");
      }

      fetchData();

      // Successfully delete review, update UI or show success
      alert(`Review ${review.review_id} has been deleted successfully!`);
    } catch (error) {
      alert("Failed to delete the review: " + error.message);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleRemoveReview(authToken)}
    >
      Remove Review
    </Button>
  );
};

export default RemoveReviewButton;
