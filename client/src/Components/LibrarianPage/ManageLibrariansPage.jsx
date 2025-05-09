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
  const [librarians, setLibrarians] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState(0);
  const [selectedLibrarianId, setSelectedLibrarianId] = useState(0);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingLibrarians, setIsLoadingLibrarians] = useState(true);

  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [librarianError, setLibrarianError] = useState("");
  const [librarianSuccess, setLibrarianSuccess] = useState("");


  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/user/allNonLibrarians`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      setUsers(data);
      console.log(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoadingUsers(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchLibrarians = async () => {
    try {
      const response = await fetch(`${API_URL}/user/allLibrarians`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      setLibrarians(data);
    } catch (err) {
      console.error("Failed to fetch librarians:", err);
    } finally {
      setIsLoadingLibrarians(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchLibrarians();
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

      fetchLibrarians();
      fetchUsers();
    } catch (error) {
      setUserError(
        "Could not add user successfully. Check fields and try again. :" +
          error.message
      );
      setUserSuccess("");
    }
  };

  const handleRemoveLibrarian = async () => {
    setLibrarianError("");
    setLibrarianSuccess("");
    console.log(selectedLibrarianId)
    try {
      const response = await fetch(
        `${API_URL}/user/librarian`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userId: selectedLibrarianId}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setLibrarianSuccess("Librarian removed successfully");
      setLibrarianError("");

      fetchLibrarians();
      fetchUsers();

    } catch (error) {
      setLibrarianError(
        "Could not remove librarian successfully. Check fields and try again. :" +
          error.message
      );
      setLibrarianSuccess("");
    }
  };

  if (isLoadingUsers || isLoadingLibrarians) {
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
        <Stack component="form" class="manageLibrariansForm">
          {userSuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{userSuccess}</p>
          )}
          {userError && (
            <p style={{ color: "red", textAlign: "center" }}>{userError}</p>
          )}
          <Stack spacing={2}>
            {/*  Select User */}
            <FormControl size="small">
              <InputLabel>Select User</InputLabel>
              <Select
                label="Select User"
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

          {librarianSuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{librarianSuccess}</p>
          )}
          {librarianError && (
            <p style={{ color: "red", textAlign: "center" }}>{librarianError}</p>
          )}
          <Stack spacing={2} marginTop={8}>
            {/*  Select Librarian */}
            <FormControl size="small">
              <InputLabel>Select Librarian</InputLabel>
              <Select
                label="Select Librarian"
                onChange={(event) => setSelectedLibrarianId(Number(event.target.value))}
              >
                {librarians.map((librarian) => (
                  <MenuItem key={librarian.libarian_id} value={librarian.librarian_id}>
                    {librarian.uname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button sx={{ color: "red" }} onClick={handleRemoveLibrarian}>
              Remove Librarian
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default ManageLibrariansPage;
