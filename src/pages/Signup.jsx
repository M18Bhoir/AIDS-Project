// src/Input/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// NOTE: Using Tailwind CSS for all styling.

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    userId: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Use relative path since backend is assumed to run on same server
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          userId: formData.userId,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Account created successfully! Please log in."); 
        navigate("/login");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please ensure the backend is running.");
      console.error("Fetch Error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
        <h2 className="text-3xl font-bold text-center text-green-700">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Your Full Name"
            />
          </div>

          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="Unique Username or Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-green-500 focus:border-green-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium 
                       text-white bg-green-600 hover:bg-green-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? 
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500 ml-1">
            Log In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
