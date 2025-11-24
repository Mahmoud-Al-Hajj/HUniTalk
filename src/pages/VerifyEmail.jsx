import "../styles/VerifyEmail.css";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    // redirect anonymous users to register/login; allow only if user exists or token present
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token && !user) {
      navigate("/register", { replace: true });
    }
  }, [navigate]);
  return (
    <div className="verifyEmailPage">
      <div className="verifyEmailCard">
        <h1>Check your email</h1>
        <p>
          We’ve sent you a verification link. Click the link in your email to
          continue.
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
