import React from "react";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    window.location.href = "/home";
    return null;
  }

  return children;
}

export default PublicRoute;
