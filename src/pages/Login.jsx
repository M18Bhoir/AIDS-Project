// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App"; // ✅ correct import path
import "../App.css"; // ✅ Tailwind is imported globally here if not already in main.jsx

const Login = () => {
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setUserId } = useAuth(); // ✅ context setter

  // 🧠 handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧠 handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || "Login successful!");
        setUserId(result.userId);
        navigate("/AgriDashboard");
      } else {
        setError(result.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(
        "An unexpected error occurred. Please ensure the backend is running."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>

          {/* Error or Success */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded">
              {success}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
          >
            Login
          </button>

          {/* Signup Redirect */}
          <p className="text-center text-sm text-gray-600 mt-3">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-green-600 hover:underline cursor-pointer font-medium"
            >
              Create one
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
