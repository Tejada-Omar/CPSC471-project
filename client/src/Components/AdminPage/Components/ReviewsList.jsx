import { useEffect, useState } from "react";
import { Stack, Typography, Card, CardContent, Box } from "@mui/material";
import { API_URL } from "../../../utils/constants";

import RemoveReviewButton from "./RemoveReviewButton"

const ReviewsList = ({ title }) => {
  const authToken = localStorage.getItem("authToken");

  const [reviewData, setReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const loanResponse = await fetch(`${API_URL}/review/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const reviewData = await loanResponse.json();
      setReviewData(reviewData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <Box mt={5}>
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          {title}
        </Typography>

        {/* Generate a card for each loan */}
        {reviewData.map((review, index) => {

          return (
            <Card
              key={review.review_id}
              sx={{
                mt: 2,
                p: 1,
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Box>
                <Stack spacing={2} direction={"row"} justifyContent={"space-between"} marginBottom={1}>
                <Typography variant="h6">Review ID: {review.review_id}</Typography>
                  <Typography variant="h6">User ID: {review.user_id}</Typography>
                  <Typography variant="h6">Book ID: {review.book_id}</Typography>
                  <Typography variant="h6">Rating: {review.rating}</Typography>
                </Stack>
                <Typography variant="h6" marginBottom={1}>Body: {review.body}</Typography>
                </Box>
                <RemoveReviewButton
                    review={review}
                    authToken={authToken}
                    fetchData={fetchData}
                  />
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
};

export default ReviewsList;
