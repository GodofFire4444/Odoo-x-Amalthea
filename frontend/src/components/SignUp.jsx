import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Fetch countries from API
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(response => response.json())
      .then(data => {
        // Format and sort countries alphabetically
        const formattedCountries = data
          .map(country => ({
            value: country.name.common.toLowerCase().replace(/\s+/g, '-'),
            label: country.name.common,
            currencies: country.currencies ? Object.keys(country.currencies).join(', ') : 'N/A'
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        
        setCountries(formattedCountries);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
        // Fallback to default countries if API fails
        setCountries([
          { value: 'india', label: 'India', currencies: 'INR' },
          { value: 'usa', label: 'United States of America', currencies: 'USD' },
          { value: 'italy', label: 'Italy', currencies: 'EUR' }
        ]);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.country || !formData.password || !formData.confirmPassword) {
      alert('Please fill all fields!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address!');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        country: countries.find(c => c.value === formData.country)?.label || formData.country
      });
      
      login(response.data.user, response.data.token);
      alert('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Sign up error:', error);
      alert(error.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div id="signup_page">
        <h1>Sign Up</h1>
        <h2>Sign up to continue</h2>
        
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

          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleInputChange}
          />

          <label htmlFor="country">Select your country</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              {countries.length === 0 ? 'Loading countries...' : 'Select a country'}
            </option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>

          <label htmlFor="password">Enter password</label>
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

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />

          <button type="submit" id="signupbutton" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p>
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .signup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          padding: 20px;
        }

        #signup_page {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        #signup_page h1,
        #signup_page h2 {
          text-align: center;
          color: #000;
          margin-bottom: 20px;
        }

        #signup_page h1 {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        #signup_page h2 {
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

        form select {
          width: 100%;
          padding: 10px 5px;
          font-size: 15px;
          border: none;
          border-bottom: 2px solid #e5e5e5;
          background-color: transparent;
          outline: none;
          cursor: pointer;
          transition: border-color 0.3s;
        }

        form select:focus {
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
          #signup_page {
            padding: 30px 25px;
            max-width: 90%;
          }

          button {
            font-size: 14px;
            padding: 12px;
          }

          form input[type="text"],
          form input[type="password"],
          form select {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;