import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import PasswordBox from "../PasswordBox";

import "./LoginStyles.css";
import { API_URL } from "../../utils/constants";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To display errors

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // Send username and password as JSON
      });

      const data = await response.json(); // Parse JSON response

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      // Save the token in localStorage
      localStorage.setItem("authToken", data.token);

      // Navigate to the next page after successful login
      navigate(`/user`);
    } catch (err) {
      // Set the error message to display on the UI
      setError(err.message);
    }
  };

  return (
    <Box id="loginBox">
      <Stack id="loginStack">
        <Typography variant="h1"> OneShelf </Typography>
        <Stack component="form" id="loginForm" spacing={5}>
          <TextField required id="loginUser" label="Username" variant="standard" onChange={(e) => setUsername(e.target.value)} value={username}/>
          <PasswordBox required onChange={(e) => setPassword(e.target.value)} value={password}></PasswordBox>
          {error && (
              <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            )}
          <Box id="loginButtonBox">
            <Button onClick={() => handleClick("/signUp")}>
              Create Account
            </Button>
            <Button onClick={handleLogin}>Login</Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LoginPage;
