import { useEffect, useState } from "react";
import { Stack, Typography, Card, CardContent, Box } from "@mui/material";
import { API_URL } from "../../../utils/constants";

import RemoveUserButton from "./removeUserButton"

const UsersList = ({ title }) => {
  const authToken = localStorage.getItem("authToken");

  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const loanResponse = await fetch(`${API_URL}/user/allUsers`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const userData = await loanResponse.json();
      setUserData(userData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <Box mt={5}>
        <Typography variant="h5" sx={{ textDecoration: "underline" }}>
          {title}
        </Typography>

        {/* Generate a card for each loan */}
        {userData.map((user, index) => {

          return (
            <Card
              key={user.user_id}
              sx={{
                mt: 2,
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stack direction={"row"} spacing={4} flexWrap="wrap" justifyContent={"space-between"} alignItems={"center"}>
                <Typography variant="h6">User ID: {user.user_id}</Typography>
                  <Typography variant="h6">Name: {user.uname}</Typography>
                  <Typography variant="h6">Address: {user.address}</Typography>
                  <Typography variant="h6">Phone Number: {user.phone_no}</Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
};

export default UsersList;
