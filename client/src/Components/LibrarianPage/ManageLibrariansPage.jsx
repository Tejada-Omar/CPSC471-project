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

import "./ManageLibrariansStyles.css";
import { API_URL } from "../../utils/constants";

const ManageLibrariansPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [users, setUsers] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState(0);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/user/allUsers`,
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

    fetchUsers();
  }, []);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleAddLibrarian = async () => {
    setUserError("");
    setUserSuccess("");
    console.log(selectedUserId)
    try {
      const response = await fetch(
        `${API_URL}/user/librarian`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId: selectedUserId}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setUserSuccess("User added successfully");
      setUserError("");
    } catch (error) {
      setUserError(
        "Could not add user successfully. Check fields and try again. :" +
          error.message
      );
      setUserSuccess("");
    }
  };

  if (isLoadingUsers) {
    return <>loading...</>;
  }

  return (
    <Box id="manageLibrariansBox">
      <Box id="manageLibrariansHeader">
        <Typography variant="h3">Manage Librarians</Typography>
        <Button onClick={() => handleClick("/librarian")}>
          Back to dashboard
        </Button>
      </Box>

      <Box id="manageLibrariansBody">
        <Stack component="form" class="manageLibrariansForm" spacing={4}>
          {userSuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{userSuccess}</p>
          )}
          {userError && (
            <p style={{ color: "red", textAlign: "center" }}>{userError}</p>
          )}
          <Stack spacing={4}>
            {/*  Select User */}
            <FormControl size="small">
              <InputLabel>Select User</InputLabel>
              <Select
                label="User"
                onChange={(event) => setSelectedUserId(Number(event.target.value))}
              >
                {users.map((user) => (
                  <MenuItem key={user.user_id} value={user.user_id}>
                    {user.uname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={handleAddLibrarian}>
              Add Librarian
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default ManageLibrariansPage;
