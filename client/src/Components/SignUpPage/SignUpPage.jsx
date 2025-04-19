import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import PasswordBox from "../PasswordBox";

import "./SignUpStyles.css";

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="signUpBox">
      <Stack id="signUpStack">
        <Typography variant="h1"> OneShelf </Typography>
        <Stack id="signUpForm" spacing={5}>
          <TextField
            required
            id="signUpUser"
            label="Create Username"
            variant="standard"
          />
          <PasswordBox label="Create Password"></PasswordBox>
          <PasswordBox label="Confirm Password"></PasswordBox>
          <TextField
            required
            id="signUpPhone"
            label="Phone Number - Ex. +1234567890"
            variant="standard"
          />
          <Box id="signUpButtonBox">
            <Button onClick={() => handleClick("/login")}>
              Back to Login
            </Button>
            <Button>Sign up</Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SignUpPage;
