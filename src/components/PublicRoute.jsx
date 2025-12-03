import React from "react";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    // Already logged in, redirect to home
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default PublicRoute;
