import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPages.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    token: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract token from URL query params if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    const result = await resetPassword(
      formData.token,
      formData.new_password,
      formData.confirm_password
    );
    
    setIsLoading(false);
    if (result.success) {
      setMessage(result.message || "Password has been reset successfully. You can now login with your new password.");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || authError);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Enter your new password</p>
      <form onSubmit={handleSubmit} className="auth-form">
        {!formData.token && (
          <input
            type="text"
            name="token"
            placeholder="Reset Token"
            value={formData.token}
            onChange={handleChange}
            className="auth-input"
            required
          />
        )}
        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          value={formData.new_password}
          onChange={handleChange}
          className="auth-input"
          required
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm New Password"
          value={formData.confirm_password}
          onChange={handleChange}
          className="auth-input"
          required
        />
        <button
          type="submit"
          className="auth-btn auth-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
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
        </div>
      )}
      {error && (
        <div className="auth-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
