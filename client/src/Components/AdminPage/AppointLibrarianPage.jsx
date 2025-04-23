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

import "./AppointLibrarianStyles.css";
import { API_URL } from "../../utils/constants";

const AppointLibrarianPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [users, setUsers] = useState([]);
  const [librarys, setLibrarys] = useState([]);

  const [selectedUser, setSelectedUser] = useState(0);
  const [selectedLibrary, setSelectedLibrary] = useState(0);

  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingLibrarys, setIsLoadingLibrarys] = useState(true);

  const [appointError, setAppointError] = useState("");
  const [appointSuccess, setAppointSuccess] = useState("");

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchLibrarys = async () => {
    try {
      const response = await fetch(`${API_URL}/library/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();

      setLibrarys(data);

    } catch (err) {
      console.error("Failed to fetch librarys:", err);
    } finally {
      setIsLoadingLibrarys(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchLibrarys();
  }, []);

  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(url);
  };

  const handleAppointLibrarian = async () => {
    setAppointError("");
    setAppointSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/user/headLibrarian`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },

          body: JSON.stringify({
            userId: selectedUser,
            libraryId: selectedLibrary
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setAppointSuccess("User appointed successfully");
      setAppointError("");

      fetchUsers();
      fetchLibrarys();
    } catch (error) {
      setAppointError(
        "Could not appoint user successfully. Check fields and try again. :" +
          error.message
      );
      setAppointSuccess("");
    }
  };

  if (isLoadingUsers || isLoadingLibrarys) {
    return <>loading...</>;
  }

  return (
    <Box id="appointLibrarianBox">
      <Box id="appointLibrarianHeader">
        <Typography variant="h3">Appoint Head Librarian</Typography>
        <Button onClick={() => handleClick("/admin")}>
          Back to dashboard
        </Button>
      </Box>

      <Box id="appointLibrarianBody">
        <Stack component="form" class="appointLibrarianForm" spacing={4}>
          {appointSuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{appointSuccess}</p>
          )}
          {appointError && (
            <p style={{ color: "red", textAlign: "center" }}>{appointError}</p>
          )}
          <Stack spacing={4}>
            {/*  Select User */}
            <FormControl size="small">
              <InputLabel>Select User</InputLabel>
              <Select
                label="Select User"
                onChange={(event) => setSelectedUser(event.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user.user_id} value={user.user_id}>
                    {user.uname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/*  Select Library */}
            <FormControl size="small">
              <InputLabel>Select Library</InputLabel>
              <Select
                label="Select Library"
                onChange={(event) => setSelectedLibrary(event.target.value)}
              >
                {librarys.map((library) => (
                  <MenuItem key={library.id} value={library.id}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={handleAppointLibrarian}>
              Appoint Head Librarian
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default AppointLibrarianPage;
