// import { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// // Create Authentication Context
// const AuthContext = createContext(null);

// // Hook for using auth context
// export const useAuth = () => useContext(AuthContext);

// // Auth Provider Component
// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Check if user is already logged in on component mount
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   // Get current authenticated user
//   const checkAuthStatus = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/auth/me', {
//         method: 'GET',
//         credentials: 'include', // Important for cookies
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         setCurrentUser(userData);
//       } else {
//         // Clear any stale user data
//         setCurrentUser(null);
//       }
//     } catch (err) {
//       console.error("Auth check failed:", err);
//       setCurrentUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Login with email and password
//   const login = async (email, password) => {
//     setError(null);
//     try {
//       const response = await fetch('/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//         credentials: 'include', // Important for cookies
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.detail || 'Login failed');
//       }
      
//       await checkAuthStatus(); // Refresh user data
//       return { success: true };
//     } catch (err) {
//       setError(err.message || "Login failed");
//       return { success: false, error: err.message };
//     }
//   };

//   // Signup with email and password
//   const signup = async (email, password, confirm_password) => {
//     setError(null);
//     if (password !== confirm_password) {
//       setError("Passwords do not match");
//       return { success: false, error: "Passwords do not match" };
//     }

//     try {
//       const response = await fetch('/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password, confirm_password }),
//         credentials: 'include', // Important for cookies
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.detail || 'Signup failed');
//       }
      
//       await checkAuthStatus(); // Refresh user data
//       return { success: true };
//     } catch (err) {
//       setError(err.message || "Signup failed");
//       return { success: false, error: err.message };
//     }
//   };

//   // OAuth login
//   const oauthLogin = async (provider, providerData) => {
//     setError(null);
//     try {
//       const payload = {
//         email: providerData.email,
//         provider: provider,
//         provider_id: providerData.id,
//         provider_token: providerData.token
//       };

//       const response = await fetch('/auth/oauth-login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//         credentials: 'include', // Important for cookies
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.detail || `${provider} login failed`);
//       }
      
//       await checkAuthStatus(); // Refresh user data
//       return { success: true };
//     } catch (err) {
//       setError(err.message || `${provider} login failed`);
//       return { success: false, error: err.message };
//     }
//   };

//   // Logout user
//   const logout = async () => {
//     try {
//       await fetch('/auth/logout', {
//         method: 'POST',
//         credentials: 'include', // Important for cookies
//       });
      
//       setCurrentUser(null);
//       navigate('/login');
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   // Request password reset
//   const forgotPassword = async (email) => {
//     setError(null);
//     try {
//       const response = await fetch('/auth/forgot-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.detail || 'Failed to send reset email');
//       }
      
//       return { 
//         success: true, 
//         message: "If the email exists in our system, a password reset link has been sent.",
//         debug_token: data.debug_token // Remove in production
//       };
//     } catch (err) {
//       setError(err.message || "Failed to send reset email");
//       return { success: false, error: err.message };
//     }
//   };

//   // Reset password with token
//   const resetPassword = async (token, new_password, confirm_password) => {
//     setError(null);
//     if (new_password !== confirm_password) {
//       setError("Passwords do not match");
//       return { success: false, error: "Passwords do not match" };
//     }

//     try {
//       const response = await fetch('/auth/reset-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ token, new_password, confirm_password }),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.detail || 'Password reset failed');
//       }
      
//       return { success: true, message: data.message };
//     } catch (err) {
//       setError(err.message || "Password reset failed");
//       return { success: false, error: err.message };
//     }
//   };

//   // Handle Google OAuth
//   const loginWithGoogle = async () => {
//     // In a real implementation, you would use the Google JavaScript SDK
//     // This is a simplified example for demonstration
    
//     // Mock Google auth data - this would come from Google's OAuth flow
//     const mockGoogleAuthData = {
//       email: "user@example.com",
//       id: "123456789",
//       token: "google-oauth-token"
//     };
    
//     return oauthLogin("google", mockGoogleAuthData);
//   };

//   // Handle Facebook OAuth
//   const loginWithFacebook = async () => {
//     // In a real implementation, you would use the Facebook JavaScript SDK
//     // This is a simplified example for demonstration
    
//     // Mock Facebook auth data - this would come from Facebook's OAuth flow
//     const mockFacebookAuthData = {
//       email: "user@example.com",
//       id: "987654321",
//       token: "facebook-oauth-token"
//     };
    
//     return oauthLogin("facebook", mockFacebookAuthData);
//   };

//   // Auth context value
//   const value = {
//     currentUser,
//     loading,
//     error,
//     login,
//     signup,
//     logout,
//     loginWithGoogle,
//     loginWithFacebook,
//     forgotPassword,
//     resetPassword
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//       {loading && <div className="auth-loading">Loading...</div>}
//     </AuthContext.Provider>
//   );
// };

// // HOC to protect routes that require authentication
// export const withAuth = (Component) => {
//   return (props) => {
//     const { currentUser, loading } = useAuth();
//     const navigate = useNavigate();
    
//     useEffect(() => {
//       if (!loading && !currentUser) {
//         navigate('/login', { replace: true });
//       }
//     }, [currentUser, loading, navigate]);
    
//     if (loading) return <div className="auth-loading">Loading...</div>;
    
//     return currentUser ? <Component {...props} /> : null;
//   };
// };


import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create Authentication Context
const AuthContext = createContext(null);

// Hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Define API base URL - critical fix
  const API_BASE_URL = "http://localhost:8000"; // Update this to your actual backend URL
  
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Login failed');
        } catch (e) {
          // If parsing fails, it's not JSON
          console.error('Non-JSON error response:', errorText);
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      await checkAuthStatus(); // Refresh user data
      return { success: true };
    } catch (err) {
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    }
  };

  // Signup with email and password
  const signup = async (email, password, confirm_password) => {
    setError(null);
    if (password !== confirm_password) {
      setError("Passwords do not match");
      return { success: false, error: "Passwords do not match" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirm_password }),
        credentials: 'include', // Important for cookies
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Signup failed');
        } catch (e) {
          // If parsing fails, it's not JSON
          console.error('Non-JSON error response:', errorText);
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      await checkAuthStatus(); // Refresh user data
      return { success: true };
    } catch (err) {
      setError(err.message || "Signup failed");
      return { success: false, error: err.message };
    }
  };

  // OAuth login
  const oauthLogin = async (provider, providerData) => {
    setError(null);
    try {
      const payload = {
        email: providerData.email,
        provider: provider,
        provider_id: providerData.id,
        provider_token: providerData.token
      };

      const response = await fetch(`${API_BASE_URL}/auth/oauth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include', // Important for cookies
      });
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || `${provider} login failed`);
        } catch (e) {
          // If parsing fails, it's not JSON
          console.error('Non-JSON error response:', errorText);
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      await checkAuthStatus(); // Refresh user data
      return { success: true };
    } catch (err) {
      setError(err.message || `${provider} login failed`);
      return { success: false, error: err.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });
      
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Failed to send reset email');
        } catch (e) {
          // If parsing fails, it's not JSON
          console.error('Non-JSON error response:', errorText);
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      return { 
        success: true, 
        message: "If the email exists in our system, a password reset link has been sent.",
        debug_token: data.debug_token // Remove in production
      };
    } catch (err) {
      setError(err.message || "Failed to send reset email");
      return { success: false, error: err.message };
    }
  };

  // Reset password with token
  const resetPassword = async (token, new_password, confirm_password) => {
    setError(null);
    if (new_password !== confirm_password) {
      setError("Passwords do not match");
      return { success: false, error: "Passwords do not match" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password, confirm_password }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON first
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || 'Password reset failed');
        } catch (e) {
          // If parsing fails, it's not JSON
          console.error('Non-JSON error response:', errorText);
          throw new Error('Server error: Please try again later');
        }
      }
      
      const data = await response.json();
      return { success: true, message: data.message };
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