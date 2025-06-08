import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthSetup';
import '../styles/history.css';

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPredictionHistory();
  }, []);

  const fetchPredictionHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/predictions/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction history');
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
      setError(err.message || 'Failed to load prediction history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="history-loading">Loading your prediction history...</div>;
  }

  if (error) {
    return <div className="history-error">Error: {error}</div>;
  }

  return (
    <div className="history-container">
      <h1>Prediction History</h1>
      <p>Welcome, {currentUser?.email}. Here's your prediction history:</p>

      {predictions.length === 0 ? (
        <div className="no-predictions">
          <p>You haven't made any predictions yet.</p>
          <button onClick={() => window.location.href = '/predict'} className="new-prediction-btn">
            Make a Prediction
          </button>
        </div>
      ) : (
        <div className="predictions-list">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="prediction-card">
              <div className="prediction-header">
                <h3>{prediction.title || `Prediction #${prediction.id}`}</h3>
                <span className="prediction-date">{formatDate(prediction.created_at)}</span>
              </div>
              
              <div className="prediction-inputs">
                <h4>Input Data:</h4>
                <pre>{JSON.stringify(prediction.input_data, null, 2)}</pre>
              </div>
              
              <div className="prediction-results">
                <h4>Results:</h4>
                <pre>{JSON.stringify(prediction.results, null, 2)}</pre>
              </div>
              
              <div className="prediction-actions">
                <button onClick={() => window.location.href = `/predict?id=${prediction.id}`} className="rerun-btn">
                  Rerun
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;