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
        <Stack id="signUpTextfieldStack" spacing={5}>
          <TextField
            id="signUpUser"
            label="Create Username"
            variant="standard"
          />
          <PasswordBox label="Create Password"></PasswordBox>
          <PasswordBox label="Confirm Password"></PasswordBox>
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
