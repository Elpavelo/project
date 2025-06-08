// src/pages/PredictionPage.js
import React, { useState, useEffect } from "react";
import "../styles/PredictionPage.css";
import logoImage from "../assets/logo.png"; // Import the logo

const PredictionPage = () => {
  const [formData, setFormData] = useState({
    employer_name: '',
    hours_worked: '',
    projects_completed: '',
    attendance_score: '',
    peer_feedback: '',
    manager_feedback: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Updated employers list to match the ones from training script
  const employers = [
    "TechCorp",
    "InnovateInc", 
    "DataSolutions",
    "StartupXYZ",
    "BigCorp",
    "SmallBiz",
    "MegaCorp",
    "TechStart",
    "BusinessPro",
    "WorkForce"
  ];

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/auth/me", {
          method: 'GET',
          credentials: 'include', // Important for cookies
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setAuthError("Please log in to use the prediction service");
        }
      } catch (err) {
        setIsAuthenticated(false);
        setAuthError("Authentication service unavailable");
        console.error(err);
      }
    };

    checkAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.employer_name) return "Employer name is required";
    
    // Hours worked validation (10-80 range as per FastAPI)
    const hours = Number(formData.hours_worked);
    if (!formData.hours_worked || hours <= 0) return "Hours worked must be positive";
    if (hours < 10 || hours > 80) return "Hours worked must be between 10 and 80";
    
    // Projects validation (0-20 range as per FastAPI)
    const projects = Number(formData.projects_completed);
    if (formData.projects_completed === '' || projects < 0) return "Projects completed cannot be negative";
    if (projects > 20) return "Projects completed cannot exceed 20";
    
    // Attendance score validation (0-10 range)
    const attendance = Number(formData.attendance_score);
    if (formData.attendance_score === '' || attendance < 0 || attendance > 10)
      return "Attendance score must be between 0 and 10";
    
    // Feedback validation (1-5 range as per training script)
    const peerFeedback = Number(formData.peer_feedback);
    const managerFeedback = Number(formData.manager_feedback);
    
    if (formData.peer_feedback === '' || peerFeedback < 1 || peerFeedback > 5)
      return "Peer feedback must be between 1 and 5";
    if (formData.manager_feedback === '' || managerFeedback < 1 || managerFeedback > 5)
      return "Manager feedback must be between 1 and 5";
  
    return null;
  };

  const handlePredictPerformance = async (e) => {
    e.preventDefault();
  
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setError(null);
    setPrediction(null);
    setIsLoading(true);
  
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employer_name: formData.employer_name,
          hours_worked: Number(formData.hours_worked),
          projects_completed: Number(formData.projects_completed),
          attendance_score: Number(formData.attendance_score),
          peer_feedback: Number(formData.peer_feedback),
          manager_feedback: Number(formData.manager_feedback)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction request failed');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message || "Failed to fetch prediction. Please check your input or the server.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'High':
        return '#4ade80'; // green
      case 'Medium':
        return '#fbbf24'; // yellow
      case 'Low':
        return '#ef4444'; // red
      default:
        return '#2563eb'; // blue
    }
  };

  // Helper function to get performance recommendations
  const getPerformanceRecommendations = (performance, inputData) => {
    const hours = Number(inputData.hours_worked);
    const projects = Number(inputData.projects_completed);
    const attendance = Number(inputData.attendance_score);
    const peerFeedback = Number(inputData.peer_feedback);
    const managerFeedback = Number(inputData.manager_feedback);

    const recommendations = [];

    if (performance === 'Low') {
      if (hours < 35) recommendations.push("Consider increasing work hours for better productivity");
      if (projects < 3) recommendations.push("Focus on completing more projects");
      if (attendance < 6) recommendations.push("Improve attendance consistency");
      if (peerFeedback < 2.5) recommendations.push("Work on improving peer relationships and collaboration");
      if (managerFeedback < 2.5) recommendations.push("Schedule regular check-ins with manager for feedback");
    } else if (performance === 'Medium') {
      if (hours > 45) recommendations.push("Consider work-life balance - efficiency over hours");
      if (projects < 5) recommendations.push("Aim to take on additional projects");
      if (attendance < 7.5) recommendations.push("Maintain consistent attendance");
      if (peerFeedback < 3.5) recommendations.push("Enhance team collaboration and communication");
      if (managerFeedback < 3.5) recommendations.push("Seek opportunities for skill development");
    } else if (performance === 'High') {
      recommendations.push("Excellent performance! Continue current practices");
      recommendations.push("Consider mentoring other team members");
      recommendations.push("Explore leadership opportunities");
    }

    return recommendations;
  };

  return (
    <div className="prediction-page">
      <div className="prediction-container">
        <div className="prediction-header">
          <div className="prediction-branding">
            <img src={logoImage} alt="Employee Performance Prediction" className="prediction-logo" />
            <h2 className="prediction-title">Employee Performance Prediction</h2>
          </div>
          <p className="prediction-subtitle">
            Input employee metrics to predict performance level
          </p>
        </div>

        {authError && (
          <div className="prediction-auth-error">
            <p>{authError}</p>
            <a href="/login" className="prediction-auth-link">Go to Login</a>
          </div>
        )}

        {isAuthenticated && (
          <form onSubmit={handlePredictPerformance} className="prediction-form">
            <div className="prediction-form-grid">
              <div className="prediction-input-group">
                <label htmlFor="employer_name">Employer:</label>
                <select
                  id="employer_name"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  aria-label="Select Employer"
                >
                  <option value="">Select Employer</option>
                  {employers.map(employer => (
                    <option key={employer} value={employer}>{employer}</option>
                  ))}
                </select>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="hours_worked">Hours Worked (per week):</label>
                <input
                  id="hours_worked"
                  type="number"
                  name="hours_worked"
                  placeholder="20-60 hours"
                  value={formData.hours_worked}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="10"
                  max="80"
                  step="0.1"
                />
                <small className="prediction-input-hint">Range: 10-80 hours per week</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="projects_completed">Projects Completed:</label>
                <input
                  id="projects_completed"
                  type="number"
                  name="projects_completed"
                  placeholder="1-10 projects"
                  value={formData.projects_completed}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="0"
                  max="20"
                />
                <small className="prediction-input-hint">Range: 0-20 projects</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="attendance_score">Attendance Score:</label>
                <input
                  id="attendance_score"
                  type="number"
                  name="attendance_score"
                  placeholder="1-10 scale"
                  value={formData.attendance_score}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="0"
                  max="10"
                  step="0.1"
                />
                <small className="prediction-input-hint">Scale: 0-10 (10 = perfect attendance)</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="peer_feedback">Peer Feedback:</label>
                <input
                  id="peer_feedback"
                  type="number"
                  name="peer_feedback"
                  placeholder="1-5 scale"
                  value={formData.peer_feedback}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                />
                <small className="prediction-input-hint">Scale: 1-5 (5 = excellent)</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="manager_feedback">Manager Feedback:</label>
                <input
                  id="manager_feedback"
                  type="number"
                  name="manager_feedback"
                  placeholder="1-5 scale"
                  value={formData.manager_feedback}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                />
                <small className="prediction-input-hint">Scale: 1-5 (5 = excellent)</small>
              </div>
            </div>

            <button
              type="submit"
              className={`prediction-btn prediction-btn-primary ${isLoading ? 'prediction-btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Predict Performance'}
            </button>
          </form>
        )}

        {error && (
          <div className="prediction-error">
            <p>{error}</p>
          </div>
        )}

        {prediction && (
          <div className="prediction-result">
            <h3>Prediction Results</h3>
            
            <div className="prediction-card">
              <div className="prediction-card-header">
                <h4>Performance Level</h4>
              </div>
              <div className="prediction-card-body">
                <div className="prediction-meter">
                  <div
                    className="prediction-meter-fill"
                    style={{
                      width: `${prediction.confidence * 100}%`,
                      backgroundColor: getPerformanceColor(prediction.performance_prediction)
                    }}
                  ></div>
                </div>
                <p className="prediction-value" style={{ color: getPerformanceColor(prediction.performance_prediction) }}>
                  {prediction.performance_prediction}
                </p>
                <p className="prediction-confidence">
                  Confidence: {(prediction.confidence * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {prediction.class_probabilities && (
              <div className="prediction-probabilities">
                <h4>Class Probabilities</h4>
                <ul>
                  {Object.entries(prediction.class_probabilities)
                    .sort((a, b) => b[1] - a[1]) // Sort by probability (descending)
                    .map(([cls, prob]) => (
                      <li key={cls}>
                        <span className="prediction-class">{cls}</span>
                        <div className="prediction-bar-container">
                          <div
                            className="prediction-bar"
                            style={{
                              width: `${prob * 100}%`,
                              backgroundColor: getPerformanceColor(cls)
                            }}
                          ></div>
                          <span className="prediction-bar-value">{(prob * 100).toFixed(2)}%</span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Enhanced insights section */}
            <div className="prediction-insights">
              <h4>Performance Insights</h4>
              <p>
                Based on the provided metrics, this employee is predicted to have
                <strong> {prediction.performance_prediction.toLowerCase()} </strong>
                performance.
              </p>
              
              {prediction.input_summary && (
                <div className="prediction-input-summary">
                  <h5>Key Metrics:</h5>
                  <ul>
                    <li>Productivity Ratio: {prediction.input_summary.calculated_features?.productivity_ratio?.toFixed(3) || 'N/A'} projects/hour</li>
                    <li>Average Feedback: {prediction.input_summary.calculated_features?.feedback_avg?.toFixed(2) || 'N/A'}/5</li>
                    <li>Feedback Consistency: {prediction.input_summary.calculated_features?.feedback_diff?.toFixed(2) || 'N/A'} difference</li>
                  </ul>
                </div>
              )}

              <div className="prediction-recommendations">
                <h5>Recommendations:</h5>
                <ul>
                  {getPerformanceRecommendations(prediction.performance_prediction, formData).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Debug info (can be hidden in production) */}
            {prediction.fallback_used && (
              <div className="prediction-debug">
                <p><em>Note: Fallback prediction logic was used due to model processing issues.</em></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionPage;