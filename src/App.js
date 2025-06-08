// // src/App.js
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, withAuth } from "./pages/Authcontext";

// import LandingPage from "./pages/LandingPage";
// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import PredictionPage from "./pages/PredictionPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import ResetPasswordPage from "./pages/ResetPasswordPage";
// import HistoryPage from "./pages/HistoryPage";
// import ProfilePage from "./pages/ProfilePage";
// import "./styles/App.css";
// import ProtectedRoute from './components/ProtectedRoute';


// //  Apply auth protection to routes that require authentication
//  const ProtectedPredictionPage = withAuth(PredictionPage);
// const ProtectedHistoryPage = withAuth(HistoryPage);
// const ProtectedProfilePage = withAuth(ProfilePage);

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//              <Routes>
//                {/* Auth Routes */}
//                <Route path="/" element={<LandingPage />} />
//                <Route path="/login" element={<LoginPage />} />
//                <Route path="/signup" element={<SignupPage />} />
//                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//                <Route path="/reset-password" element={<ResetPasswordPage />} />
               
//                {/* Protected Routes */}
//                <Route path="/predict" element={<ProtectedPredictionPage />} />
//                <Route path="/history" element={<ProtectedHistoryPage />} />
//                <Route path="/profile" element={<ProtectedProfilePage />} />
               
//                {/* Redirect root to login or prediction page */}
//                <Route path="/" element={<Navigate to="/predict" replace />} />
               
//                {/* Catch all unknown routes */}
//                <Route path="*" element={<Navigate to="/login" replace />} />
//              </Routes>
//            </AuthProvider>
//     </Router>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import pages
import LandingPage from "./pages/LandingPage";
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

// Import global styles
import './styles/App.css';
import './styles/Dashboard.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/predict" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect authenticated users to dashboard */}
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all unknown routes - redirect to landing or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;