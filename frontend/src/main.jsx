<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import App from './App.jsx'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
=======
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import App from "./App.jsx";
import "./index.css";

function Root() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (stored && token) {
        setUser(JSON.parse(stored));
        setPage("dashboard");
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  if (page === "dashboard" && user) {
    return <App user={user} onLogout={handleLogout} />;
  }

  if (page === "register") {
    return (
      <Register
        onRegisterSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setPage("login")}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setPage("register")}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
>>>>>>> f8ba98404503cf63ed5e8a07a29a533bfa02f661
