import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!user.email_verified) {
    // Logged in but email not verified
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

export default ProtectedRoute;
