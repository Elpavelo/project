// src/components/Footer.js
import React from "react";
import "../styles/Footer.css";
import logoImage from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src={logoImage} alt="Employee Performance Prediction" className="footer-logo-img" />
        </div>
        <div className="footer-content">
          <p className="footer-copyright">
            &copy; {currentYear} Employee Performance Prediction System. All rights reserved.
          </p>
          <nav className="footer-nav">
            <a href="/about" className="footer-link">About</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Service</a>
            <a href="/contact" className="footer-link">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;