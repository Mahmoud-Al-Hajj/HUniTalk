import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import DarkVeil from "../components/DarkVeil";
import "../styles/login.css";

function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register",
        {
          name: userName,
          email: email,
          password: password,
          major: major,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Store user data - check different possible response structures
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } else if (response.data.data && response.data.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        } else {
          // If no user data returned, create it from form data
          const userData = {
            name: userName,
            email: email,
            major: major,
          };
          localStorage.setItem("user", JSON.stringify(userData));
        }

        // Navigate to home after successful registration
        window.location.href = "/home";
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(
          error.response.data.errors || {
            register: [
              error.response.data.message ||
                "Registration failed. Please try again.",
            ],
          }
        );
      } else {
        setErrors({
          register: [
            "Unable to connect to the server. Please try again later.",
          ],
        });
      }
    }
  };
  return (
    <div className="page-wrapper">
      <DarkVeil />
      <div className="card-container">
        <h1 className="card-title">Create an account</h1>

        <form>
          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="error-box">
              {Object.keys(errors).map((field) =>
                errors[field].map((msg, index) => (
                  <p key={`${field}-${index}`} className="error-text">
                    {msg}
                  </p>
                ))
              )}
            </div>
          )}

          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="userName">Username</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="JimmyOrval@gmail.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="major">Major</label>
            <input
              type="text"
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Enter your major"
              required
            />
          </div>

          {/* Submit Button */}
          <button type="button" className="submit-btn" onClick={handleSubmit}>
            Create account
          </button>

          {/* Sign in Link */}
          <p className="sign_up">
            Already have an account? <a href="./login">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
