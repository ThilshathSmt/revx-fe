import React, { useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";  // Import signOut from next-auth/react

const SignOut = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOutClick = async () => {
    setLoading(true);
    try {
      // Call the signOut function from next-auth to expire the session
      await signOut({
        callbackUrl: "/auth/signin", // Redirect to the sign-in page after logout
      });
    } catch (error) {
      console.error("Error during sign-out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h6">Are you sure you want to sign out?</Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSignOutClick}
        disabled={loading}
        sx={{
          marginTop: 2,
          backgroundColor: "#d32f2f",
          "&:hover": { backgroundColor: "#c62828" },
        }}
      >
        {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign Out"}
      </Button>
    </div>
  );
};

export default SignOut;
