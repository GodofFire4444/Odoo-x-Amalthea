import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { demoAccounts } from '../constants/demoAccounts';
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
  const { addToast } = useToast();

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
      addToast({
        type: 'warning',
        title: 'Missing details',
        message: 'Enter a username and password to continue.'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.signin(formData);
      login(response.data.user, response.data.token);
      addToast({
        type: 'success',
        title: 'Welcome back',
        message: `Signed in as ${response.data.user.username}.`
      });
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      addToast({
        type: 'error',
        title: 'Sign in failed',
        message: error.response?.data?.message || 'Invalid credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (account) => {
    setFormData({
      username: account.username,
      password: account.password
    });
    setShowPassword(false);
  };

  return (
    <div className="signin-container">
      <div className="signin-layout">
        <section className="signin-hero">
          <div className="eyebrow">Demo-ready expense workflow</div>
          <h1>Expense approvals that look real on stage.</h1>
          <p>
            Sign in with one of the seeded demo accounts to jump straight into a believable
            admin, manager, or employee flow.
          </p>

          <div className="hero-points">
            <div>
              <strong>Deterministic seed</strong>
              <span>Resettable company, users, approvals, and mixed expense states.</span>
            </div>
            <div>
              <strong>3 role paths</strong>
              <span>Admin setup, manager approvals, and employee submission are ready to show.</span>
            </div>
          </div>

          <div className="demo-accounts">
            <span className="section-label">Quick demo logins</span>
            <div className="demo-account-grid">
              {demoAccounts.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => handleDemoFill(account)}
                  className="demo-account-chip"
                >
                  <strong>{account.label}</strong>
                  <span>{account.username}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="signin-card">
          <h2>Sign In</h2>
          <p className="signin-subtitle">Welcome back. Use a seeded account or your own credentials.</p>

          <form onSubmit={handleSubmit} className="signin-form">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
            />

            <label className="checkbox-container" htmlFor="show-password">
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show password
            </label>

            <button type="submit" id="signinbutton" disabled={loading} className="primary-button">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="signin-footer">
              Need a fresh company? <Link to="/signup">Create one</Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .signin-container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signin-layout {
          width: min(1180px, 100%);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        .signin-hero,
        .signin-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          border: 1px solid var(--demo-border);
          border-radius: 28px;
          box-shadow: var(--demo-shadow);
        }

        .signin-hero {
          padding: 2.25rem;
          display: grid;
          gap: 1.5rem;
          align-content: start;
        }

        .eyebrow,
        .section-label {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: rgba(15, 118, 110, 0.1);
          color: var(--demo-primary-strong);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .signin-hero h1 {
          margin: 0;
          font-size: clamp(2.4rem, 4vw, 4rem);
          line-height: 1.02;
          letter-spacing: -0.05em;
          max-width: 10ch;
        }

        .signin-hero p {
          margin: 0;
          color: var(--demo-muted);
          font-size: 1.02rem;
          max-width: 58ch;
        }

        .hero-points {
          display: grid;
          gap: 0.9rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .hero-points div {
          padding: 1rem;
          border-radius: 20px;
          background: var(--demo-surface-muted);
          border: 1px solid var(--demo-border);
          display: grid;
          gap: 0.35rem;
        }

        .hero-points strong {
          font-size: 0.96rem;
        }

        .hero-points span {
          color: var(--demo-muted);
          font-size: 0.92rem;
        }

        .demo-accounts {
          display: grid;
          gap: 0.85rem;
        }

        .demo-account-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .demo-account-chip {
          width: 100%;
          border: 1px solid var(--demo-border);
          background: #fff;
          color: var(--demo-text);
          border-radius: 18px;
          padding: 0.9rem 1rem;
          text-align: left;
          display: grid;
          gap: 0.2rem;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .demo-account-chip:hover {
          transform: translateY(-1px);
          border-color: rgba(15, 118, 110, 0.25);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
        }

        .demo-account-chip strong {
          font-size: 0.95rem;
        }

        .demo-account-chip span {
          font-size: 0.84rem;
          color: var(--demo-muted);
          word-break: break-word;
        }

        .signin-card {
          padding: 2.25rem;
          display: grid;
          align-content: start;
        }

        .signin-card h2 {
          margin: 0;
          font-size: 2rem;
          letter-spacing: -0.04em;
        }

        .signin-subtitle {
          margin: 0.35rem 0 1.5rem;
          color: var(--demo-muted);
        }

        .signin-form {
          display: grid;
          gap: 0.85rem;
        }

        .signin-form label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--demo-text);
        }

        .signin-form input[type='text'],
        .signin-form input[type='password'] {
          width: 100%;
          padding: 0.92rem 1rem;
          border: 1px solid var(--demo-border);
          border-radius: 16px;
          background: var(--demo-surface);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .signin-form input[type='text']:focus,
        .signin-form input[type='password']:focus {
          outline: none;
          border-color: rgba(15, 118, 110, 0.45);
          box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
        }

        .checkbox-container {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-weight: 500;
          color: var(--demo-muted);
          cursor: pointer;
          user-select: none;
        }

        .primary-button {
          margin-top: 0.5rem;
          padding: 0.95rem 1.15rem;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--demo-primary), var(--demo-primary-strong));
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
        }

        .primary-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signin-footer {
          margin: 0.6rem 0 0;
          color: var(--demo-muted);
          text-align: center;
        }

        .signin-footer a {
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .signin-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .signin-container {
            padding: 1rem;
          }

          .signin-hero,
          .signin-card {
            padding: 1.25rem;
            border-radius: 22px;
          }

          .hero-points,
          .demo-account-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SignInPage;