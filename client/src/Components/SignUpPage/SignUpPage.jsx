import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import PasswordBox from "../PasswordBox";

import "./SignUpStyles.css";
import { API_URL } from "../../utils/constants";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pNo, setPNo] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  // const handlePasswordChange = (input) => {
  //   setPassword(input);
  // };

  // const handleConfirmPasswordChange = (input) => {
  //   setConfirmPassword(input);
  // };

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword || !pNo) {
      setError("Please fill out all sign up fields.");
      return;
    }
    if (password != confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    try {
      console.log(`in the error: username: ${username}, password: ${password}, phonenum: ${pNo}, confirm: ${confirmPassword}`);
      const response = await fetch(`${API_URL}/user/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, pNo, address }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }
      navigate("/login")

    } catch (err) {
      setError(err.message);
    }
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
            onChange={(event) => setUsername(event.target.value)}
          />
          <PasswordBox label="Create Password *" onChange={(event) => setPassword(event.target.value)}></PasswordBox>
          <PasswordBox label="Confirm Password *" onChange={(event) => setConfirmPassword(event.target.value)}></PasswordBox>
          <TextField
            required
            id="signUpPhone"
            label="Phone Number - Ex. +1234567890"
            variant="standard"
            onChange={(event) => setPNo(event.target.value)}
          />
          <TextField
            required
            id="signUpAddress"
            label="Address"
            variant="standard"
            onChange={(event) => setAddress(event.target.value)}
          />
          {error && (
              <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            )}
          <Box id="signUpButtonBox">
            <Button onClick={() => handleClick("/login")}>Back to Login</Button>
            <Button onClick={handleSignUp}>Sign up</Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SignUpPage;
