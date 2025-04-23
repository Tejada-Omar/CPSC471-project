import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import "./UnappointLibrarianStyles.css";
import { API_URL } from "../../utils/constants";

const UnappointLibrarianPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(0);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [unappointError, setUnappointError] = useState("");
  const [unappointSuccess, setUnappointSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/user/allHeadLibrarians`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();

      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoadingUsers(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleUnappointLibrarian = async () => {
    setUnappointError("");
    setUnappointSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/user/headLibrarian`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },

          body: JSON.stringify({
            userId: selectedUser
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setUnappointSuccess("User unappointed successfully");
      setUnappointError("");

      fetchUsers();
    } catch (error) {
      setUnappointError(
        "Could not unappoint user successfully. Check fields and try again. :" +
          error.message
      );
      setUnappointSuccess("");
    }
  };

  if (isLoadingUsers) {
    return <>loading...</>;
  }

  return (
    <Box id="unappointLibrarianBox">
      <Box id="unappointLibrarianHeader">
        <Typography variant="h3">Unappoint Librarian</Typography>
        <Button onClick={() => handleClick("/admin")}>
          Back to dashboard
        </Button>
      </Box>

      <Box id="unappointLibrarianBody">
        <Stack component="form" class="unappointLibrarianForm" spacing={4}>
          {unappointSuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{unappointSuccess}</p>
          )}
          {unappointError && (
            <p style={{ color: "red", textAlign: "center" }}>{unappointError}</p>
          )}
          <Stack spacing={4}>
            {/*  Select User */}
            <FormControl size="small">
              <InputLabel>Select Head Librarian</InputLabel>
              <Select
                label="Select Head Librarian"
                onChange={(event) => setSelectedUser(event.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user.user_id} value={user.user_id}>
                    {user.uname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={handleUnappointLibrarian}>
              Unappoint Head Librarian
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default UnappointLibrarianPage;
