import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppHeader = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <>
      <nav className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="header-home-link">
              <span className="header-logo">Amalthea</span>
              <span className="header-subtitle">Expense Management</span>
            </Link>
            {title && (
              <div className="header-current-page">
                <span className="breadcrumb-separator">/</span>
                <span className="page-title">{title}</span>
                {subtitle && <span className="page-subtitle">{subtitle}</span>}
              </div>
            )}
          </div>

          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="header-logout-btn"
              title="Sign out"
            >
              ← Logout
            </button>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .app-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--demo-border);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
          min-width: 0;
        }

        .header-home-link {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          text-decoration: none;
          color: inherit;
          white-space: nowrap;
        }

        .header-logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--demo-primary);
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: var(--demo-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .header-current-page {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          font-size: 0.9rem;
        }

        .breadcrumb-separator {
          color: var(--demo-border);
          font-weight: 300;
        }

        .page-title {
          font-weight: 600;
          color: var(--demo-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .page-subtitle {
          display: none;
          color: var(--demo-muted);
          font-size: 0.85rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          white-space: nowrap;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.2rem;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--demo-text);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--demo-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .header-logout-btn {
          background: var(--demo-danger);
          color: white;
          border: none;
          padding: 0.5rem 0.9rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .header-logout-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 0.75rem 1rem;
          }

          .header-content {
            gap: 1rem;
          }

          .header-left {
            gap: 1rem;
          }

          .page-subtitle {
            display: block;
          }

          .header-current-page {
            flex-direction: column;
            gap: 0.3rem;
            align-items: flex-start;
          }

          .breadcrumb-separator {
            display: none;
          }

          .header-logo {
            font-size: 1.1rem;
          }

          .user-info {
            align-items: flex-end;
            gap: 0;
          }

          .user-name {
            font-size: 0.8rem;
          }

          .user-role {
            font-size: 0.7rem;
          }

          .header-logout-btn {
            padding: 0.4rem 0.7rem;
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            gap: 0.75rem;
          }

          .header-left {
            gap: 0.5rem;
          }

          .header-right {
            gap: 0.75rem;
          }

          .page-title {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

export default AppHeader;
