import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api/apiService';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log(`LoginPage: Attempting to ${isSignUp ? 'sign up' : 'log in'} with email: ${email}`);

      // Determine whether to sign up or log in
      let response;
      if (isSignUp) {
        response = await apiService.signup({ email, password });
        console.log('LoginPage: Sign up successful');
      } else {
        response = await apiService.login({ email, password });
        console.log('LoginPage: Login successful');
      }

      // Store the token
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        // Store user info if available
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Redirect to notes page
        navigate('/notes');
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error(`LoginPage: ${isSignUp ? 'Sign up' : 'Login'} failed:`, error);
      setError(
        error.response?.data?.message || 
        error.message || 
        `Failed to ${isSignUp ? 'sign up' : 'log in'}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="app-title">Lynxjs Notes App</h1>
          <p className="app-tagline">Securely capture and organize your thoughts</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
              className="email-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="password-input"
            />
          </div>
          
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {isSignUp 
              ? 'Already have an account?' 
              : 'Don\'t have an account?'
            }
            <button 
              type="button"
              onClick={toggleMode}
              className="toggle-mode-button"
              disabled={loading}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;