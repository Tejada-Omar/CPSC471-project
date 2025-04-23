import { Button } from "@mui/material";

import { API_URL } from "../../../utils/constants";

const RemoveUserButton = ({ user, authToken, fetchData }) => {
  const handleRemoveUser = async (authToken) => {
    try {
      const userResponse = confirm(
        `Remove this user with id ${user.user_id}?`,
      );

      if (!userResponse) {
        return;
      }

      console.log("Deleting user with User ID:", user.user_id);

      // API call
      const response = await fetch(`${API_URL}/user/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({userId: user.user_id}),
      });

      if (!response.ok) {
        throw new Error("Failed to delete the user");
      }

      fetchData();

      // Successfully delete user, update UI or show success
      alert(`User ${user.user_id} has been deleted successfully!`);
    } catch (error) {
      alert("Failed to delete the user: " + error.message);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleRemoveUser(authToken)}
    >
      Remove User
    </Button>
  );
};

export default RemoveUserButton;
