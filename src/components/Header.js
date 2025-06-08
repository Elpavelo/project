// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logoImage from "../assets/logo.png"; // You'll need to save the logo in this location

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="header-logo-link">
          <img src={logoImage} alt="Employee Performance Prediction" className="header-logo" />
        </Link>
        <h1 className="header-title">Employee Performance Prediction System</h1>
      </div>
    </header>
  );
};

export default Header;