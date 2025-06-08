import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, withAuth } from "./AuthSetup";
import "./styles/App.css";

// Auth Pages
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";

// App Pages - wrap these with withAuth HOC to protect them
import PredictionPage from "./PredictionPage";
import HistoryPage from "./HistoryPage";
import ProfilePage from "./ProfilePage";

// Apply auth protection to routes that require authentication
const ProtectedPredictionPage = withAuth(PredictionPage);
const ProtectedHistoryPage = withAuth(HistoryPage);
const ProtectedProfilePage = withAuth(ProfilePage);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/predict" element={<ProtectedPredictionPage />} />
          <Route path="/history" element={<ProtectedHistoryPage />} />
          <Route path="/profile" element={<ProtectedProfilePage />} />
          
          {/* Redirect root to login or prediction page */}
          <Route path="/" element={<Navigate to="/predict" replace />} />
          
          {/* Catch all unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
