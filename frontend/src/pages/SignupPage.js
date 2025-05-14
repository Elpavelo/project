import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing again
    setError(null);
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.email || !formData.password || !formData.confirm_password) {
      setError("All fields are required");
      return false;
    }
    
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    // Password matching
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    
    // Password strength (minimum 8 characters)
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate form inputs
    if (!validateForm()) {
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
        // Show success message
        setSuccess("Account created successfully! Redirecting to login page...");
        // Set redirecting state
        setRedirecting(true);
        // Clear form
        setFormData({
          email: '',
          password: '',
          confirm_password: ''
        });
        
        // Set timeout to redirect after showing success message
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              fromSignup: true,
              email: formData.email 
            } 
          });
        }, 2000); // Redirect after 2 seconds
      } else {
        setError(result.error || authError || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again later.");
      console.error("Signup error:", err);
    }
  };

  // Clean up the timeout if the component unmounts
  useEffect(() => {
    return () => {
      if (redirecting) {
        clearTimeout();
      }
    };
  }, [redirecting]);

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Let's get started with your account!</p>
      
      {success && (
        <div className="auth-success">
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form" style={{ width: '100%' }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="auth-input"
          required
          disabled={isLoading || redirecting}
        />
        <input
          type="password"
          name="password"
          placeholder="Password (minimum 8 characters)"
          value={formData.password}
          onChange={handleChange}
          className="auth-input"
          required
          disabled={isLoading || redirecting}
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
          className="auth-input"
          required
          disabled={isLoading || redirecting}
        />
        <button
          type="submit"
          className="auth-btn auth-btn-primary"
          disabled={isLoading || redirecting}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <div className="auth-footer">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="auth-link-btn"
            disabled={isLoading || redirecting}
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
  );
};

export default SignupPage;