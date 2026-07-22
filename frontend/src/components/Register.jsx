import { useState } from "react";
import api from "../services/api";
import "../styles/Auth.css";

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        register_number: rollNumber.trim(),
        password,
        confirm_password: confirmPassword,
      });

      // Store token and user info
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      onRegisterSuccess(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">M</div>
          <h1>MentorAI</h1>
          <p>Your AI Academic Mentor</p>
        </div>

        <div className="auth-form-wrapper">
          <h2>Sign Up</h2>
          <p className="auth-subtitle">Create your account to get started</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                id="rollNumber"
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="e.g., 24CY001"
                disabled={loading}
                required
              />
              <small className="form-help">
                Your roll number from the institution (e.g., 24CY001, 24CY002)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 4 characters)"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || !rollNumber || !password || !confirmPassword}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={onSwitchToLogin}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

