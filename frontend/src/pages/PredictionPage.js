// src/pages/PredictionPage.js
import React, { useState, useEffect } from "react";
import "../styles/PredictionPage.css";

const PredictionPage = () => {
  const [formData, setFormData] = useState({
    employer_name: '',
    hours_worked: '',
    projects_completed: '',
    attendance_score: '',  // Make sure this field exists
    peer_feedback: '',
    manager_feedback: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // List of employers from the CSV
  const employers = [
    "Acme Corp",
    "Globex Inc",
    "Soylent Ltd",
    "Initech",
    "Umbrella Corp"
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
    if (!formData.hours_worked || formData.hours_worked <= 0) return "Hours worked must be positive";
    if (!formData.projects_completed || formData.projects_completed < 0) return "Projects completed cannot be negative";
    if (!formData.attendance_score || formData.attendance_score < 0 || formData.attendance_score > 10)
      return "Attendance score must be between 0 and 10";
    if (!formData.peer_feedback || formData.peer_feedback < 0 || formData.peer_feedback > 10)
      return "Peer feedback must be between 0 and 10";
    if (!formData.manager_feedback || formData.manager_feedback < 0 || formData.manager_feedback > 10)
      return "Manager feedback must be between 0 and 10";
  
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
          attendance_score: Number(formData.attendance_score),  // Make sure this is included
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

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h2 className="prediction-title">Employee Performance Prediction</h2>
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
              <label htmlFor="hours_worked">Hours Worked:</label>
              <input
                id="hours_worked"
                type="number"
                name="hours_worked"
                placeholder="20-60"
                value={formData.hours_worked}
                onChange={handleChange}
                className="prediction-input"
                required
                min="1"
                max="168"
              />
            </div>

            <div className="prediction-input-group">
              <label htmlFor="projects_completed">Projects Completed:</label>
              <input
                id="projects_completed"
                type="number"
                name="projects_completed"
                placeholder="1-9"
                value={formData.projects_completed}
                onChange={handleChange}
                className="prediction-input"
                required
                min="0"
              />
            </div>

            <div className="prediction-input-group">
              <label htmlFor="attendance_score">Attendance Score:</label>
              <input
                id="attendance_score"
                type="number"
                name="attendance_score"
                placeholder="0-10"
                value={formData.attendance_score}
                onChange={handleChange}
                className="prediction-input"
                required
                min="0"
                max="10"
                step="0.1"
              />
            </div>

            <div className="prediction-input-group">
              <label htmlFor="peer_feedback">Peer Feedback:</label>
              <input
                id="peer_feedback"
                type="number"
                name="peer_feedback"
                placeholder="0-10"
                value={formData.peer_feedback}
                onChange={handleChange}
                className="prediction-input"
                required
                min="0"
                max="10"
                step="0.1"
              />
            </div>

            <div className="prediction-input-group">
              <label htmlFor="manager_feedback">Manager Feedback:</label>
              <input
                id="manager_feedback"
                type="number"
                name="manager_feedback"
                placeholder="0-10"
                value={formData.manager_feedback}
                onChange={handleChange}
                className="prediction-input"
                required
                min="0"
                max="10"
                step="0.1"
              />
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

          <div className="prediction-insights">
            <h4>Performance Insights</h4>
            <p>
              Based on the provided metrics, this employee is predicted to have
              <strong> {prediction.performance_prediction.toLowerCase()} </strong>
              performance.
              {prediction.performance_prediction === 'High' &&
                'This employee is likely meeting or exceeding expectations across multiple metrics.'}
              {prediction.performance_prediction === 'Medium' &&
                'This employee is performing adequately but may have room for improvement in some areas.'}
              {prediction.performance_prediction === 'Low' &&
                'This employee may benefit from additional support or training in key performance areas.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;