import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Rating,
} from "@mui/material";

const ReviewDialog = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = () => {
    onSubmit({ rating, reviewText });
    setRating(0);
    setReviewText("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          p: 1,
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>Leave a Review</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
          />
          <TextField
            label="Your Review"
            multiline
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!rating || reviewText.trim() === ""}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;
