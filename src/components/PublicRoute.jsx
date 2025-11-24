import React from "react";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (token && user?.email_verified) {
    // Already logged in and email verified
    return <Navigate to="/home" replace />;
  }

  if (token && !user?.email_verified) {
    // Logged in but email not verified
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

export default PublicRoute;
