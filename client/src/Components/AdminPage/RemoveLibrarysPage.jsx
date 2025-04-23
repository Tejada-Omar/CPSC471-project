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

import "./RemoveLibrarysStyles.css";
import { API_URL } from "../../utils/constants";

const RemoveLibrarysPage = () => {
  const authToken = localStorage.getItem("authToken");

  const [librarys, setLibrarys] = useState([]);

  const [selectedLibrary, setSelectedLibrary] = useState(0);

  const [isLoadingLibrarys, setIsLoadingLibrarys] = useState(true);

  const [libraryError, setLibraryError] = useState("");
  const [librarySuccess, setLibrarySuccess] = useState("");

  const fetchLibrarys = async () => {
    try {
      const response = await fetch(`${API_URL}/library/`,
        {
          method: "GET",
          headers: {
            Libraryization: `Bearer ${authToken}`,
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

  const handleRemoveLibrary = async () => {
    setLibraryError("");
    setLibrarySuccess("");

    try {
      const response = await fetch(
        `${API_URL}/library/${selectedLibrary}`,
        {
          method: "DELETE",
          headers: {
            Libraryization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not successful, show an error
        throw new Error(data.error || "An unexpected error occurred");
      }

      setLibrarySuccess("Library deleted successfully");
      setLibraryError("");

      fetchLibrarys();
    } catch (error) {
      setLibraryError(
        "Could not delete library successfully. Check fields and try again. :" +
          error.message
      );
      setLibrarySuccess("");
    }
  };

  if (isLoadingLibrarys) {
    return <>loading...</>;
  }

  return (
    <Box id="removeLibrarysBox">
      <Box id="removeLibrarysHeader">
        <Typography variant="h3">Remove Librarys</Typography>
        <Button onClick={() => handleClick("/admin")}>
          Back to dashboard
        </Button>
      </Box>

      <Box id="removeLibrarysBody">
        <Stack component="form" class="removeLibrarysForm" spacing={4}>
          {librarySuccess && (
            <p style={{ color: "green", textAlign: "center" }}>{librarySuccess}</p>
          )}
          {libraryError && (
            <p style={{ color: "red", textAlign: "center" }}>{libraryError}</p>
          )}
          <Stack spacing={4}>
            {/*  Select Library */}
            <FormControl size="small">
              <InputLabel>Library</InputLabel>
              <Select
                label="Library"
                onChange={(event) => setSelectedLibrary(event.target.value)}
              >
                {librarys.map((library) => (
                  <MenuItem key={library.id} value={library.id}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button sx={{ color: "red" }} onClick={handleRemoveLibrary}>
              Remove Library
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default RemoveLibrarysPage;
