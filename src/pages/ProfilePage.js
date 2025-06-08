import React, { useState } from 'react';
import { useAuth } from './AuthSetup';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileFormData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordFormData.currentPassword,
          new_password: passwordFormData.newPassword,
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change password');
      }
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-header">
          <h2>{currentUser?.name || currentUser?.email}</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
        
        <div className="profile-details">
          {!isEditingProfile ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{currentUser?.email}</span>
              </div>
              
              {currentUser?.name && (
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{currentUser.name}</span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Account Type:</span>
                <span className="detail-value">
                  {currentUser?.provider ? `${currentUser.provider} Account` : 'Email Account'}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Member Since:</span>
                <span className="detail-value">
                  {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <button 
                onClick={() => setIsEditingProfile(true)} 
                className="edit-profile-btn"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileFormData.name}
                  onChange={handleProfileChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileChange}
                  disabled={!!currentUser?.provider}
                />
                {currentUser?.provider && (
                  <small>Email cannot be changed for {currentUser.provider} accounts</small>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => setIsEditingProfile(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {!currentUser?.provider && (
        <div className="password-section">
          <h3>Security</h3>
          
          {!isChangingPassword ? (
            <button 
              onClick={() => setIsChangingPassword(true)} 
              className="change-password-btn"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={changePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Update Password</button>
                <button 
                  type="button" 
                  onClick={() => setIsChangingPassword(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      
      <div className="account-section">
        <h3>Account Settings</h3>
        <button className="danger-btn">Delete My Account</button>
      </div>
    </div>
  );
};

export default ProfilePage;