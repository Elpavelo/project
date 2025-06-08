// src/pages/ForgotPasswordPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import "../styles/AuthPages.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [debugToken, setDebugToken] = useState(null); // For development only
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    const result = await forgotPassword(email);
    
    setIsLoading(false);
    if (result.success) {
      setMessage(result.message);
      if (result.debug_token) {
        // For development only - remove in production
        setDebugToken(result.debug_token);
      }
    } else {
      setError(result.error || authError);
    }
  };

  const handleGoToReset = () => {
    if (debugToken) {
      navigate(`/reset-password?token=${debugToken}`);
    }
  };

  return (
    <div>
      <Header />
      <div className="auth-container">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to reset your password</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="auth-input"
            required
          />
          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="auth-footer">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="auth-link-btn"
            >
              Back to Login
            </button>
          </div>
        </form>
        {message && (
          <div className="auth-message">
            <p>{message}</p>
            {debugToken && (
              <div className="debug-section">
                <p>DEBUG MODE: Token received</p>
                <button 
                  onClick={handleGoToReset}
                  className="auth-btn"
                >
                  Go to Reset Page
                </button>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="auth-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;