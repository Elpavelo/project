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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from "./pages/LandingPage";
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PredictionPage from './pages/PredictionPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route 
            path="/predict" 
            element={
              <ProtectedRoute>
                <PredictionPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;