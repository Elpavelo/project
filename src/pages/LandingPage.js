// src/pages/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div className="landing-container">
        <h1 className="landing-title">EMPLOYEE PERFORMANCE PREDICTION SYSTEM</h1>
        <p className="landing-subtitle">WE ARE HAPPY HAVING YOU IN THIS OUR APP</p>
        <div className="landing-buttons">
          <button 
            onClick={() => navigate('/login')} 
            className="landing-btn landing-btn-primary"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')} 
            className="landing-btn landing-btn-secondary"
          >
            SignUp
          </button>
        </div>
        <p className="landing-subtitle mt-4">LET'S GET STARTED</p>
      </div>
    </div>
  );
};

export default LandingPage;