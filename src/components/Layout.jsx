import React from "react";
import NavBar from "./NavBar";
import TopBar from "./TopBar";
import "../styles/Layout.css";

function Layout({ children, onCreatePost }) {
  return (
    <div className="app-layout">
      <NavBar />
      <TopBar onCreatePost={onCreatePost} />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
