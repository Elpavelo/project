import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create Authentication Context
const AuthContext = createContext(null);

// Hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Define API base URL - can be overridden with environment variable
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const AUTH_PATH = "/auth"; // All auth requests go to the auth subpath
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Get current authenticated user
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${AUTH_PATH}/me`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        // Clear any stale user data
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_PATH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });

      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Login failed');
        } catch (e) {
          // If parsing fails, it's not JSON
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      setCurrentUser(data); // Set user data from response
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    }
  };

  // Signup with email and password
  const signup = async (email, password, confirmPassword) => {
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return { success: false, error: "Passwords do not match" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_PATH}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          confirm_password: confirmPassword 
        }),
        credentials: 'include', // Important for cookies
      });

      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Signup failed');
        } catch (e) {
          // If parsing fails, it's not JSON
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      // Don't set current user - require login first (as in the axios implementation)
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Signup failed");
      return { success: false, error: err.message };
    }
  };

  // OAuth login (generic handler for different providers)
  const oauthLogin = async (provider, providerData) => {
    setError(null);
    try {
      const payload = {
        email: providerData.email,
        provider: provider,
        provider_id: providerData.id,
        provider_token: providerData.token
      };

      const response = await fetch(`${API_BASE_URL}${AUTH_PATH}/oauth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include', // Important for cookies
      });
      
      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || `${provider} login failed`);
        } catch (e) {
          // If parsing fails, it's not JSON
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      setCurrentUser(data); // Set user data from response
      return { success: true, data };
    } catch (err) {
      setError(err.message || `${provider} login failed`);
      return { success: false, error: err.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}${AUTH_PATH}/logout`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });
      
      setCurrentUser(null);
      navigate('/login');
      return { success: true };
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
      return { success: false, error: "Logout failed. Please try again." };
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_PATH}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Failed to send reset email');
        } catch (e) {
          // If parsing fails, it's not JSON
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      return { 
        success: true, 
        message: "If the email exists in our system, a password reset link has been sent.",
        data
      };
    } catch (err) {
      setError(err.message || "Failed to send reset email");
      return { success: false, error: err.message };
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword, confirmPassword) => {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return { success: false, error: "Passwords do not match" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${AUTH_PATH}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          new_password: newPassword, 
          confirm_password: confirmPassword 
        }),
      });

      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Password reset failed');
        } catch (e) {
          // If parsing fails, it's not JSON
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      return { success: true, message: data.message || "Password reset successful" };
    } catch (err) {
      setError(err.message || "Password reset failed");
      return { success: false, error: err.message };
    }
  };

  // Handle Google OAuth
  const loginWithGoogle = async () => {
    // In a real implementation, you would use the Google JavaScript SDK
    // This is a simplified example for demonstration
    
    // Mock Google auth data - this would come from Google's OAuth flow
    const mockGoogleAuthData = {
      email: "user@example.com",
      id: "123456789",
      token: "google-oauth-token"
    };
    
    return oauthLogin("google", mockGoogleAuthData);
  };

  // Handle Facebook OAuth
  const loginWithFacebook = async () => {
    // In a real implementation, you would use the Facebook JavaScript SDK
    // This is a simplified example for demonstration
    
    // Mock Facebook auth data - this would come from Facebook's OAuth flow
    const mockFacebookAuthData = {
      email: "user@example.com",
      id: "987654321",
      token: "facebook-oauth-token"
    };
    
    return oauthLogin("facebook", mockFacebookAuthData);
  };

  // Auth context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && <div className="auth-loading">Loading...</div>}
    </AuthContext.Provider>
  );
};

// HOC to protect routes that require authentication
export const withAuth = (Component) => {
  return (props) => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!loading && !currentUser) {
        navigate('/login', { replace: true });
      }
    }, [currentUser, loading, navigate]);
    
    if (loading) return <div className="auth-loading">Loading...</div>;
    
    return currentUser ? <Component {...props} /> : null;
  };
};

export default AuthContext;