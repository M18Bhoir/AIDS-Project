// src/App.jsx
import React, { createContext, useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./Home/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AgriDashboard from "./pages/AgriDashboard";

// --- Auth Context ---
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  const loginUser = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const logoutUser = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ userId, setUserId: loginUser, logoutUser }}>
      <Router>
        <Routes>
          {/* 🌱 Landing Page (Default Route) */}
          <Route path="/" element={<LandingPage />} />

          {/* 🔐 Auth Pages */}
          <Route
            path="/login"
            element={userId ? <Navigate to="/AgriDashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={userId ? <Navigate to="/AgriDashboard" /> : <Signup />}
          />

          {/* 🌾 Protected Dashboard */}
          <Route
            path="/AgriDashboard"
            element={userId ? <AgriDashboard /> : <Navigate to="/login" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
