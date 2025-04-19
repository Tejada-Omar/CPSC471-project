import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import PasswordBox from "../PasswordBox";

import "./LoginStyles.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  return (
    <Box id="loginBox">
      <Stack id="loginStack">
        <Typography variant="h1"> OneShelf </Typography>
        <Stack component="form" id="loginForm" spacing={5}>
          <TextField id="loginUser" label="Username" variant="standard" />
          <PasswordBox></PasswordBox>
          <Box id="loginButtonBox">
            <Button onClick={() => handleClick("/signUp")}>
              Create Account
            </Button>
            <Button onClick={() => handleClick("/")}>Login</Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LoginPage;
