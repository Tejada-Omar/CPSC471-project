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
      <Typography variant="h3">Hello user!</Typography>
    </Box>
  );
};

export default UserPage;
