import React, { useState, useEffect } from 'react';
import "../styles/Dashboard.css";
import "../styles/PredictionPage.css";

const Dashboard = () => {
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
  const [activeView, setActiveView] = useState('dashboard');

  // Mock dashboard data
  const dashboardStats = {
    totalReports: 5,
    inProgress: 1,
    completed: 2,
    performanceImpact: 78
  };

  const recentReports = [
    { name: "High Performance Analysis", status: "pending", daysAgo: 2 },
    { name: "Team Productivity Review", status: "in-progress", daysAgo: 5 },
    { name: "Performance Metrics Study", status: "completed", daysAgo: 7 }
  ];

  const performanceData = [
    { name: "High", value: 45, color: "#10b981" },
    { name: "Medium", value: 35, color: "#f59e0b" },
    { name: "Low", value: 20, color: "#ef4444" }
  ];

  const performanceTypeData = [
    { type: "Excellent", percentage: 45 },
    { type: "Good", percentage: 30 },
    { type: "Average", percentage: 15 },
    { type: "Below Average", percentage: 10 }
  ];

  const reportStatusData = [
    { status: "Completed", percentage: 65 },
    { status: "In Progress", percentage: 20 },
    { status: "Pending", percentage: 15 }
  ];

  // Employers list matching the Python training script
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
          credentials: 'include',
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
    
    // Hours worked validation (20-60 range to match realistic model training)
    const hours = Number(formData.hours_worked);
    if (!formData.hours_worked || hours <= 0) return "Hours worked must be positive";
    if (hours < 20 || hours > 60) return "Hours worked must be between 20 and 60 hours per week";
    
    // Projects validation (1-12 range to match model training data)
    const projects = Number(formData.projects_completed);
    if (formData.projects_completed === '' || projects < 0) return "Projects completed cannot be negative";
    if (projects > 12) return "Projects completed cannot exceed 12 per period";
    
    // Attendance score validation (1-10 range to match model)
    const attendance = Number(formData.attendance_score);
    if (formData.attendance_score === '' || attendance < 1 || attendance > 10)
      return "Attendance score must be between 1 and 10";
    
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
      const inputData = {
        employer_name: formData.employer_name,
        hours_worked: Number(formData.hours_worked),
        projects_completed: Number(formData.projects_completed),
        attendance_score: Number(formData.attendance_score),
        peer_feedback: Number(formData.peer_feedback),
        manager_feedback: Number(formData.manager_feedback)
      };

      const response = await fetch("http://localhost:8000/predict", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData)
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

  // Enhanced performance recommendations based on model features
  const getPerformanceRecommendations = (performance, inputData) => {
    const hours = Number(inputData.hours_worked);
    const projects = Number(inputData.projects_completed);
    const attendance = Number(inputData.attendance_score);
    const peerFeedback = Number(inputData.peer_feedback);
    const managerFeedback = Number(inputData.manager_feedback);
    
    // Calculate derived features that the model uses
    const productivityRatio = projects / hours;
    const feedbackAvg = (peerFeedback + managerFeedback) / 2;
    const feedbackDiff = Math.abs(peerFeedback - managerFeedback);

    const recommendations = [];

    if (performance === 'Low') {
      // Low performers need significant improvements
      if (hours < 35) recommendations.push("🕐 Consider increasing work hours to 35-45 hours per week for optimal productivity");
      if (projects < 3) recommendations.push("📈 Focus on completing more projects - aim for 3-6 projects per period");
      if (attendance < 6) recommendations.push("📅 Improve attendance consistency - target above 6.0 on the attendance scale");
      if (peerFeedback < 2.5) recommendations.push("🤝 Work on improving peer relationships and team collaboration");
      if (managerFeedback < 2.5) recommendations.push("👨‍💼 Schedule regular check-ins with manager and seek specific feedback");
      if (productivityRatio < 0.08) recommendations.push("⚡ Focus on improving efficiency - aim for higher project completion per hour");
      if (feedbackDiff > 1.5) recommendations.push("🎯 Work to align manager and peer perceptions through consistent performance");
    } else if (performance === 'Medium') {
      // Medium performers can optimize for high performance
      if (hours > 50) recommendations.push("⚖️ Consider work-life balance - efficiency often matters more than total hours");
      if (projects < 5) recommendations.push("🎯 Aim to take on 5-8 additional projects to boost performance rating");
      if (attendance < 7.5) recommendations.push("📋 Maintain more consistent attendance - target 8+ on attendance scale");
      if (feedbackAvg < 3.5) recommendations.push("📊 Work to improve overall feedback scores - aim for 3.5+ average");
      if (productivityRatio < 0.12) recommendations.push("🚀 Enhance productivity ratio - focus on efficient project completion");
      if (feedbackDiff > 1.0) recommendations.push("🔄 Ensure consistent performance across all relationships");
      recommendations.push("💡 You're on track for high performance - focus on consistency and efficiency");
    } else if (performance === 'High') {
      // High performers - maintain and mentor
      recommendations.push("🌟 Excellent performance! Continue your current successful practices");
      recommendations.push("🎓 Consider mentoring other team members to share your expertise");
      recommendations.push("🚀 Explore leadership opportunities and challenging projects");
      recommendations.push("📈 Your productivity ratio of " + productivityRatio.toFixed(3) + " projects/hour is exemplary");
      if (feedbackAvg >= 4.0) recommendations.push("🏆 Outstanding feedback scores - you're a team asset");
    }

    // Add general efficiency insights
    if (productivityRatio > 0.15) {
      recommendations.push("⚡ Exceptional efficiency detected - " + productivityRatio.toFixed(3) + " projects per hour");
    }
    
    if (feedbackDiff < 0.5) {
      recommendations.push("🎯 Excellent consistency between peer and manager feedback");
    }

    return recommendations;
  };

  // Helper function to get performance insights based on derived features
  const getPerformanceInsights = (inputData) => {
    const hours = Number(inputData.hours_worked);
    const projects = Number(inputData.projects_completed);
    const attendance = Number(inputData.attendance_score);
    const peerFeedback = Number(inputData.peer_feedback);
    const managerFeedback = Number(inputData.manager_feedback);
    
    // Calculate the same derived features as the model
    const productivityRatio = projects / hours;
    const feedbackAvg = (peerFeedback + managerFeedback) / 2;
    const feedbackDiff = Math.abs(peerFeedback - managerFeedback);

    return {
      productivity_ratio: productivityRatio,
      feedback_avg: feedbackAvg,
      feedback_diff: feedbackDiff,
      hours_category: hours < 35 ? 'Low' : hours > 50 ? 'High' : 'Optimal',
      attendance_category: attendance < 5 ? 'Poor' : attendance < 7 ? 'Average' : 'Excellent',
      feedback_consistency: feedbackDiff < 0.5 ? 'Highly Consistent' : feedbackDiff < 1.0 ? 'Consistent' : 'Inconsistent'
    };
  };

  const StatCard = ({ title, value, subtitle, color = "#0ea5e9" }) => (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-card-content">
        <div className="dashboard-stat-card-info">
          <p className="dashboard-stat-card-title">{title}</p>
          <p className="dashboard-stat-card-value" style={{ color }}>{value}</p>
          {subtitle && <p className="dashboard-stat-card-subtitle">{subtitle}</p>}
        </div>
        <div className="dashboard-stat-card-indicator" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  );

  const ReportItem = ({ name, status, daysAgo }) => {
    return (
      <div className="dashboard-report-item">
        <div className="dashboard-report-info">
          <p className="dashboard-report-name">{name}</p>
          <p className="dashboard-report-time">{daysAgo} days ago</p>
        </div>
        <span className={`dashboard-report-status ${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
        </span>
      </div>
    );
  };

  const DashboardView = () => (
    <>
      {/* Dashboard Header */}
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Dashboard</h1>
        <p className="dashboard-page-subtitle">Welcome back! Here's an overview of your performance reports.</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard title="Total Reports" value={dashboardStats.totalReports} subtitle="From last month" color="#0ea5e9" />
        <StatCard title="In Progress" value={dashboardStats.inProgress} subtitle="Currently being processed" color="#f59e0b" />
        <StatCard title="Completed" value={dashboardStats.completed} subtitle="Successfully reported" color="#10b981" />
        <StatCard title="Performance Impact" value={`${dashboardStats.performanceImpact}%`} subtitle="Impact value achieved" color="#14b8a6" />
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Reports */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Recent Reports</h3>
            <p className="dashboard-card-description">Your most recent performance reports</p>
          </div>
          <div className="dashboard-reports-list">
            {recentReports.map((report, index) => (
              <ReportItem key={index} name={report.name} status={report.status} daysAgo={report.daysAgo} />
            ))}
          </div>
          <button className="dashboard-view-all-button">
            View All Reports
          </button>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Quick Actions</h3>
            <p className="dashboard-card-description">Common tasks you can perform</p>
          </div>
          
          <div className="dashboard-actions-list">
            <button 
              onClick={() => setActiveView('prediction')}
              className="dashboard-action-button primary"
            >
              🎯 Report New Performance
            </button>
            <button className="dashboard-action-button secondary">
              📋 View My Reports
            </button>
          </div>

          <div className="dashboard-tip-box">
            <h4 className="dashboard-tip-title">Performance Tip</h4>
            <p className="dashboard-tip-text">
              Maintain 35-45 work hours per week with 5+ projects and consistent 8+ attendance for optimal performance ratings.
            </p>
          </div>
        </div>
      </div>

      {/* Performance Management Statistics */}
      <div className="dashboard-stats-section">
        <div className="dashboard-stats-header">
          <h3 className="dashboard-stats-title">Performance Management Statistics</h3>
          <p className="dashboard-stats-description">Your contribution to overall team performance</p>
        </div>
        
        <div className="dashboard-tabs">
          <button className="dashboard-tab active">Weekly</button>
          <button className="dashboard-tab">Monthly</button>
          <button className="dashboard-tab">Yearly</button>
        </div>

        <div className="dashboard-charts-grid">
          {/* Performance Type Reported */}
          <div className="dashboard-chart-section">
            <h4 className="dashboard-chart-title">Performance Type Distribution</h4>
            <div className="dashboard-chart-bars">
              {performanceTypeData.map((item, index) => (
                <div key={index} className="dashboard-chart-bar-item">
                  <span className="dashboard-chart-bar-label">{item.type}</span>
                  <div className="dashboard-chart-bar-container">
                    <div className="dashboard-chart-bar-background">
                      <div 
                        className="dashboard-chart-bar-fill blue" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="dashboard-chart-bar-value">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report Status */}
          <div className="dashboard-chart-section">
            <h4 className="dashboard-chart-title">Report Status</h4>
            <div className="dashboard-chart-bars">
              {reportStatusData.map((item, index) => {
                const colorClass = item.status === 'Completed' ? 'green' :
                                 item.status === 'In Progress' ? 'blue' : 'yellow';
                return (
                  <div key={index} className="dashboard-chart-bar-item">
                    <span className="dashboard-chart-bar-label">{item.status}</span>
                    <div className="dashboard-chart-bar-container">
                      <div className="dashboard-chart-bar-background">
                        <div 
                          className={`dashboard-chart-bar-fill ${colorClass}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="dashboard-chart-bar-value">{item.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const PredictionView = () => (
    <div className="prediction-container">
      <div className="prediction-header">
        <h1 className="prediction-title">Employee Performance Prediction</h1>
        <p className="prediction-subtitle">Advanced ML model trained on 2000+ employee records with balanced class prediction</p>
      </div>

      {authError && (
        <div className="prediction-auth-error">
          <p>{authError}</p>
          <a href="/login" className="prediction-auth-link">Go to Login</a>
        </div>
      )}

      {isAuthenticated ? (
        <>
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
                  placeholder="35-45 hours optimal"
                  value={formData.hours_worked}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="20"
                  max="60"
                  step="0.1"
                />
                <small className="prediction-input-hint">Optimal range: 35-45 hours per week (Model trained on 20-60 range)</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="projects_completed">Projects Completed:</label>
                <input
                  id="projects_completed"
                  type="number"
                  name="projects_completed"
                  placeholder="5-8 projects for high performance"
                  value={formData.projects_completed}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="0"
                  max="12"
                />
                <small className="prediction-input-hint">High performers typically complete 6-12 projects</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="attendance_score">Attendance Score:</label>
                <input
                  id="attendance_score"
                  type="number"
                  name="attendance_score"
                  placeholder="8+ for high performance"
                  value={formData.attendance_score}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="1"
                  max="10"
                  step="0.1"
                />
                <small className="prediction-input-hint">Scale: 1-10 (High performers average 8.5+)</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="peer_feedback">Peer Feedback:</label>
                <input
                  id="peer_feedback"
                  type="number"
                  name="peer_feedback"
                  placeholder="4+ for high performance"
                  value={formData.peer_feedback}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                />
                <small className="prediction-input-hint">Scale: 1-5 (High performers average 4.2+)</small>
              </div>

              <div className="prediction-input-group">
                <label htmlFor="manager_feedback">Manager Feedback:</label>
                <input
                  id="manager_feedback"
                  type="number"
                  name="manager_feedback"
                  placeholder="4+ for high performance"
                  value={formData.manager_feedback}
                  onChange={handleChange}
                  className="prediction-input"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                />
                <small className="prediction-input-hint">Scale: 1-5 (High performers average 4.3+)</small>
              </div>
            </div>

            <div className="prediction-model-info">
              <h4>🧠 Model Information</h4>
              <p>This prediction uses a Random Forest model trained on 2000+ employee records with balanced class distribution (25% Low, 50% Medium, 25% High performance).</p>
            </div>

            <button
              type="submit"
              className={`prediction-btn prediction-btn-primary ${isLoading ? 'prediction-btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing with ML Pipeline...' : 'Predict Performance'}
            </button>
          </form>

          {error && (
            <div className="prediction-error">
              <p>❌ {error}</p>
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <h3>🎯 Prediction Results</h3>
              
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
                    Model Confidence: {(prediction.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              {prediction.class_probabilities && (
                <div className="prediction-probabilities">
                  <h4>📊 Class Probabilities</h4>
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

              {/* Enhanced insights section with derived features */}
              <div className="prediction-insights">
                <h4>📈 Performance Analysis</h4>
                <p>
                  Based on the ML model analysis, this employee is predicted to have
                  <strong> {prediction.performance_prediction.toLowerCase()} </strong>
                  performance level.
                </p>
                
                <div className="prediction-input-summary">
                  <h5>🔍 Key Metrics Analysis:</h5>
                  {(() => {
                    const insights = getPerformanceInsights(formData);
                    return (
                      <ul>
                        <li><strong>Productivity Ratio:</strong> {insights.productivity_ratio.toFixed(3)} projects/hour 
                            ({insights.productivity_ratio > 0.15 ? '🌟 Exceptional' : 
                              insights.productivity_ratio > 0.12 ? '✅ Good' : 
                              insights.productivity_ratio > 0.08 ? '⚠️ Average' : '🔴 Below Average'})</li>
                        <li><strong>Average Feedback:</strong> {insights.feedback_avg.toFixed(2)}/5 
                            ({insights.feedback_avg >= 4.0 ? '🌟 Excellent' : 
                              insights.feedback_avg >= 3.0 ? '✅ Good' : '🔴 Needs Improvement'})</li>
                        <li><strong>Feedback Consistency:</strong> {insights.feedback_consistency} 
                            (Difference: {insights.feedback_diff.toFixed(2)})</li>
                        <li><strong>Work Hours Category:</strong> {insights.hours_category} 
                            ({formData.hours_worked} hours/week)</li>
                        <li><strong>Attendance Level:</strong> {insights.attendance_category} 
                            ({formData.attendance_score}/10)</li>
                      </ul>
                    );
                  })()}
                </div>

                <div className="prediction-recommendations">
                  <h5>💡 AI-Powered Recommendations:</h5>
                  <ul>
                    {getPerformanceRecommendations(prediction.performance_prediction, formData).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model transparency info */}
              <div className="prediction-model-details">
                <h5>🔬 Model Details</h5>
                <div className="prediction-model-stats">
                  <span>Algorithm: Random Forest</span>
                  <span>Training Samples: 2000+</span>
                  <span>Features Used: 8</span>
                  <span>Balanced Classes: ✅</span>
                </div>
              </div>

              {/* Debug info */}
              {prediction.fallback_used && (
                <div className="prediction-debug">
                  <p><em>⚠️ Note: Fallback prediction logic was used due to model processing issues.</em></p>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="35" cy="35" r="15" />
                <rect x="25" y="50" width="20" height="30" rx="5" />
                <rect x="55" y="20" width="35" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M65 35 L70 30 L75 40 L80 25 L85 35" stroke="currentColor" strokeWidth="2" fill="none" />
                <rect x="65" y="45" width="3" height="8" />
                <rect x="70" y="48" width="3" height="5" />
                <rect x="75" y="42" width="3" height="11" />
                <rect x="80" y="46" width="3" height="7" />
                <rect x="85" y="40" width="3" height="13" />
              </svg>
            </div>
            <span className="dashboard-logo-text">EmpPerform</span>
            <span className="dashboard-pro-badge">Pro</span>
          </div>
          <div className="dashboard-nav">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`dashboard-nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('prediction')}
              className={`dashboard-nav-button ${activeView === 'prediction' ? 'active' : ''}`}
            >
              Performance Prediction
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <nav className="dashboard-sidebar-nav">
            <li className="dashboard-sidebar-item">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`dashboard-sidebar-button ${activeView === 'dashboard' ? 'active' : ''}`}
              >
                📊 Dashboard
              </button>
            </li>
            <li className="dashboard-sidebar-item">
              <button
                onClick={() => setActiveView('prediction')}
                className={`dashboard-sidebar-button ${activeView === 'prediction' ? 'active' : ''}`}
              >
                🎯 Performance Prediction
              </button>
            </li>
            <li className="dashboard-sidebar-item">
              <a href="#" className="dashboard-sidebar-link">
                📋 Performance Reports
              </a>
            </li>
            <li className="dashboard-sidebar-item">
              <a href="#" className="dashboard-sidebar-link">
                👤 My Reports
              </a>
            </li>
            <li className="dashboard-sidebar-item">
              <a href="#" className="dashboard-sidebar-link">
                ⚙️ Settings
              </a>
            </li>
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {activeView === 'dashboard' ? <DashboardView /> : <PredictionView />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;