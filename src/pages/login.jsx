import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import DarkVeil from "../components/DarkVeil";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await axios.post(
        "https://hunitalk-production.up.railway.app/api/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Login API Response:", response);

      // Check for token in different common fields (token, access_token)
      const token = response.data.token || response.data.access_token;

      if ((response.status === 200 || response.status === 201) && token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user_id", String(response.data.id));

        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("username", response.data.user.name);
          // Save separate user id for legacy checks
          if (response.data.user.id !== undefined) {
            localStorage.setItem("user_id", String(response.data.user.id));
          }
        }

        console.log("Login successful, navigating to home...");
        navigate("/home");
      } else {
        console.warn("Login response missing token:", response.data);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(
          error.response.data.errors || {
            login: [
              error.response.data.message ||
                "Invalid credentials. Please check your email and password.",
            ],
          }
        );
      } else {
        setErrors({
          login: ["Unable to connect to the server. Please try again later."],
        });
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="card-container">
        <h1 className="card-title"> Welcome Back !</h1>
        <DarkVeil />
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
          {/* <div className="form-group">
  <label htmlFor="email">Email</label>
  <input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="someone@students.haigazian.edu.lb"
    required
    pattern="^[A-Za-z0-9._%+-]+@students\.haigazian\.edu\.lb$"
    title="Email must end with @students.haigazian.edu.lb"
  />
</div> */}

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
          <button
            type="button"
            className="login-submit-btn"
            onClick={handleSubmit}
          >
            Login
          </button>

          {/* Sign up Link */}
          <p className="sign_up">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
