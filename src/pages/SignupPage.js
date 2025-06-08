// src/pages/SignupPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import "../styles/AuthPages.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing again
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.confirm_password
      );

      setIsLoading(false);
      
      if (result.success) {
        // Instead of navigating to /predict, redirect to login with success message
        navigate('/login', { 
          state: { 
            fromSignup: true, 
            email: formData.email,
            message: "Account created successfully! Please login with your credentials."
          } 
        });
      } else {
        setError(result.error || authError || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again later.");
      console.error("Signup error:", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="auth-container">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Let's get started with your account!</p>
        
        <form onSubmit={handleSubmit} className="auth-form" style={{ width: '100%' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="auth-input"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <div className="auth-footer">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="auth-link-btn"
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
        </form>
        
        {error && (
          <div className="auth-error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;