// src/pages/LoginPage.js (partial update)
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import "../styles/AuthPages.css";

// Import SVG icons directly for better quality
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white" />
    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.47002L20.0303 3.04498C17.9502 1.17998 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.28027 6.63L5.27026 9.5C6.21526 6.7 8.87528 4.75 12.0003 4.75Z" fill="#EA4335" />
    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 20.925C22.2 18.81 23.49 15.8 23.49 12.275Z" fill="#4285F4" />
    <path d="M5.26499 14.5C5.01499 13.72 4.87 12.88 4.87 12C4.87 11.12 5.01499 10.28 5.26499 9.5L1.27502 6.63C0.465024 8.27 0 10.08 0 12C0 13.92 0.465024 15.73 1.28001 17.37L5.26499 14.5Z" fill="#FBBC05" />
    <path d="M12.0001 24C15.2401 24 17.9651 22.93 19.9451 20.93L16.0801 18.1C15.0101 18.86 13.6251 19.25 12.0001 19.25C8.8751 19.25 6.2151 17.3 5.2701 14.5L1.28015 17.37C3.25515 21.31 7.3101 24 12.0001 24Z" fill="#34A853" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.38823 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2" />
    <path d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.80102 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C11.3674 24.0486 12.6326 24.0486 13.875 23.8542V15.4688H16.6711Z" fill="white" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginWithFacebook, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're coming from signup page and pre-fill email
  useEffect(() => {
    if (location.state?.fromSignup) {
      setSuccess("Account created successfully! Please login with your credentials.");
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing again
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await login(formData.email, formData.password);
      
      setIsLoading(false);
      
      if (result.success) {
        navigate('/predict');
      } else {
        setError(result.error || authError || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again later.");
      console.error("Login error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await loginWithGoogle();
      
      setIsLoading(false);
      
      if (result.success) {
        navigate('/predict');
      } else {
        setError(result.error || authError || "Google login failed. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred with Google login. Please try again later.");
      console.error("Google login error:", err);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await loginWithFacebook();
      
      setIsLoading(false);
      
      if (result.success) {
        navigate('/predict');
      } else {
        setError(result.error || authError || "Facebook login failed. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred with Facebook login. Please try again later.");
      console.error("Facebook login error:", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="auth-container">
        <h2 className="auth-title">Login Here</h2>
        <p className="auth-subtitle">Hello, we are happy having you back!!!</p>
        
        {success && (
          <div className="auth-success">
            <p>{success}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="auth-form" style={{ width: '100%' }}>
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
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => {
              navigate('/forgot-password');
            }}
            disabled={isLoading}
          >
            Forgot Your Password?
          </button>
          <button
            type="submit"
            className="auth-btn auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="auth-social-login">
            <span className="auth-social-text">Or continue with</span>
          </div>
          <div className="auth-social-buttons">
            <button 
              type="button" 
              className="auth-social-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              aria-label="Sign in with Google"
            >
              <GoogleIcon />
            </button>
            <button 
              type="button" 
              className="auth-social-btn"
              onClick={handleFacebookLogin}
              disabled={isLoading}
              aria-label="Sign in with Facebook"
            >
              <FacebookIcon />
            </button>
          </div>
          <div className="auth-footer">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="auth-link-btn"
              disabled={isLoading}
            >
              Sign Up
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

export default LoginPage;