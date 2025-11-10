import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import DarkVeil from "../components/DarkVeil";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });
      if (response.status === 200) {
        // Handle successful login
      }
    } catch (error) {
      setErrors(
        error.response.data.errors || {
          login: ["Invalid credentials check your email and password."],
        }
      );
    }
  };

  return (
    <div className="page-wrapper">
      <DarkVeil />
      <div className="card-container">
        <h1 className="card-title"> Welcome Back !</h1>

        <form onSubmit={handleSubmit}>
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

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            Login
          </button>

          {/* Sign up Link */}
          <p className="sign_up">
            Don't have an account? <a href="./register">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
