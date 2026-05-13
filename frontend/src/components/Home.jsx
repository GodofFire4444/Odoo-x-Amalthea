import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRoles = [
    {
      name: 'Admin',
      path: '/admin',
      allowedRoles: ['admin'],
      icon: '⚙️',
      description: 'System oversight & approval rule management'
    },
    {
      name: 'Manager',
      path: '/manager',
      allowedRoles: ['manager', 'admin'],
      icon: '✓',
      description: 'Review and approve team expenses'
    },
    {
      name: 'Employee',
      path: '/employee',
      allowedRoles: ['employee', 'manager', 'admin'],
      icon: '📋',
      description: 'Submit & track expense reports'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Filter roles based on user's actual role
  const availableRoles = userRoles.filter(role =>
    role.allowedRoles.includes(user?.role)
  );

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="navbar-title">Amalthea Expense</h1>
            <p className="navbar-subtitle">Intelligent Workflow Engine</p>
          </div>
          <div className="navbar-right">
            <span className="user-badge">{user?.username} · {user?.role}</span>
            <button
              onClick={handleLogout}
              className="navbar-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-main">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="hero-content">
            <h2 className="hero-headline">Your Role Dashboard</h2>
            <p className="hero-subtitle">
              Access your workspace. Manage expenses and approvals seamlessly.
            </p>
          </div>
        </section>

        {/* Product Features Mini Section */}
        <section className="product-features">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Smart OCR</h3>
            <p>Scan receipts automatically. Extract details in seconds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Approval Workflows</h3>
            <p>Sequential, parallel, or custom rule-based approvals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💱</div>
            <h3>Multi-Currency</h3>
            <p>Support expenses across any company location worldwide.</p>
          </div>
        </section>

        {/* Workflow Visualization */}
        <section className="workflow-section">
          <h3 className="section-title">How It Works</h3>
          <div className="workflow-steps">
            <div className="step">
              <div className="step-number">1</div>
              <strong>Submit</strong>
              <span>Employee submits expense with receipt</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <strong>Process</strong>
              <span>OCR extracts details automatically</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <strong>Approve</strong>
              <span>Workflow routes for appropriate approver</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <strong>Complete</strong>
              <span>Approved expense recorded and visible</span>
            </div>
          </div>
        </section>

        {/* Role Cards */}
        <section className="role-cards">
          <h3 className="section-title">Select Your Workspace</h3>
          <div className="cards-grid">
            {availableRoles.map((role) => (
              <Link
                key={role.path}
                to={role.path}
                className="role-card"
              >
                <div className="card-icon">{role.icon}</div>
                <h3 className="card-title">{role.name}</h3>
                <p className="card-description">{role.description}</p>
                <div className="card-cta">Enter Dashboard →</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        /* Navbar */
        .home-navbar {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--demo-border);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-content {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-left {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .navbar-title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--demo-primary);
          letter-spacing: -0.02em;
        }

        .navbar-subtitle {
          margin: 0;
          font-size: 0.8rem;
          color: var(--demo-muted);
          font-weight: 500;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .user-badge {
          font-size: 0.9rem;
          color: var(--demo-muted);
          background: var(--demo-surface-muted);
          padding: 0.5rem 0.75rem;
          border-radius: 999px;
          font-weight: 500;
        }

        .navbar-logout-btn {
          background: var(--demo-danger);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease;
          font-size: 0.9rem;
        }

        .navbar-logout-btn:hover {
          opacity: 0.9;
        }

        /* Main Content */
        .home-main {
          flex: 1;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        /* Hero Section */
        .home-hero {
          text-align: center;
          padding: 1rem 0;
        }

        .hero-headline {
          margin: 0 0 0.5rem;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--demo-text);
        }

        .hero-subtitle {
          margin: 0;
          font-size: 1.1rem;
          color: var(--demo-muted);
          max-width: 60ch;
          margin-left: auto;
          margin-right: auto;
        }

        /* Product Features */
        .product-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid var(--demo-border);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          border-color: rgba(15, 118, 110, 0.2);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .feature-card h3 {
          margin: 0.5rem 0 0.35rem;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--demo-text);
        }

        .feature-card p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--demo-muted);
          line-height: 1.4;
        }

        /* Workflow Section */
        .workflow-section {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid var(--demo-border);
          border-radius: 24px;
          padding: 2rem;
        }

        .section-title {
          margin: 0 0 1.5rem;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--demo-text);
        }

        .workflow-steps {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          overflow-x: auto;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          text-align: center;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--demo-primary);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1rem;
        }

        .step strong {
          font-size: 0.95rem;
          color: var(--demo-text);
        }

        .step span {
          font-size: 0.8rem;
          color: var(--demo-muted);
          line-height: 1.3;
        }

        .step-arrow {
          color: var(--demo-muted);
          font-size: 1.5rem;
          font-weight: 300;
        }

        /* Role Cards */
        .role-cards {
          padding: 0.5rem 0;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .role-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border: 1.5px solid var(--demo-border);
          border-radius: 24px;
          padding: 1.75rem;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .role-card:hover {
          transform: translateY(-4px);
          border-color: var(--demo-primary);
          box-shadow: 0 24px 48px rgba(15, 118, 110, 0.12);
          background: rgba(255, 255, 255, 1);
        }

        .card-icon {
          font-size: 2.5rem;
          margin-bottom: 0.25rem;
        }

        .card-title {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--demo-text);
        }

        .card-description {
          margin: 0;
          font-size: 0.95rem;
          color: var(--demo-muted);
          line-height: 1.5;
          flex-grow: 1;
        }

        .card-cta {
          margin-top: 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--demo-primary);
          transition: transform 0.2s ease;
        }

        .role-card:hover .card-cta {
          transform: translateX(4px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .home-main {
            padding: 1.5rem;
            gap: 2rem;
          }

          .navbar-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .navbar-right {
            width: 100%;
            justify-content: space-between;
          }

          .workflow-steps {
            gap: 0.75rem;
          }

          .step-arrow {
            transform: rotate(90deg);
            margin: 0.5rem 0;
          }

          .hero-headline {
            font-size: 1.75rem;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .home-navbar {
            padding: 0.75rem 1rem;
          }

          .navbar-title {
            font-size: 1.1rem;
          }

          .workflow-steps {
            flex-direction: column;
          }

          .step-arrow {
            transform: rotate(0deg);
            writing-mode: vertical-rl;
            text-orientation: mixed;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;