import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Home/LandingPage";
import Login from "./Input/Login";
import Signup from "./Input/Signup";
import CropYield from "./Yield/CropYield";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/login" />
        <Route path="/login/CropYield" element={<CropYield />} />


      </Routes>
    </Router>
  );
}

export default App;
