import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";

import "./UserStyles.css";

const UserPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="userBox">
      <Box id="userHeader">
        <Typography variant="h3">Hello user!</Typography>
        <Button onClick={() => handleClick("/")}>Return home</Button>
      </Box>

      <Box id="userLoans">
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          My Loans
        </Typography>
      </Box>
    </Box>
  );
};

export default UserPage;
