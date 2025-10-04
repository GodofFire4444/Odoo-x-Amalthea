import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      alert('Please fill all fields!');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.signin(formData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      alert(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div id="main_box">
        <h1 id="signin-heading">Sign In</h1>
        <h2 id="welcome_message">Welcome back!</h2>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleInputChange}
          />

          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
          />

          <div className="checkbox-container">
            <label htmlFor="show-password">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show password
            </label>
          </div>

          <button type="submit" id="signinbutton" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .signin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          padding: 20px;
        }

        #main_box {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        #signin-heading,
        #welcome_message {
          text-align: center;
          color: #000;
          margin-bottom: 20px;
        }

        #signin-heading {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        #welcome_message {
          font-size: 16px;
          font-weight: 400;
          color: #666;
          margin-bottom: 30px;
        }

        form label {
          display: block;
          margin: 20px 0 8px;
          font-weight: 600;
          color: #000;
          font-size: 14px;
        }

        form input[type="text"],
        form input[type="password"] {
          width: 100%;
          border: none;
          border-bottom: 2px solid #e5e5e5;
          padding: 10px 5px;
          font-size: 15px;
          background-color: transparent;
          outline: none;
          transition: border-color 0.3s;
        }

        form input[type="text"]:focus,
        form input[type="password"]:focus {
          border-bottom-color: #000;
        }

        .checkbox-container {
          margin: 15px 0;
        }

        .checkbox-container label {
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #666;
          cursor: pointer;
        }

        form input[type="checkbox"] {
          margin-right: 8px;
          cursor: pointer;
        }

        button {
          width: 100%;
          padding: 14px;
          background-color: #000;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          margin-top: 25px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #333;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        form p {
          margin-top: 25px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        form a {
          color: #000;
          text-decoration: none;
          font-weight: 600;
          margin-left: 5px;
        }

        form a:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          #main_box {
            padding: 30px 25px;
            max-width: 90%;
          }

          button {
            font-size: 14px;
            padding: 12px;
          }

          form input[type="text"],
          form input[type="password"] {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignInPage;