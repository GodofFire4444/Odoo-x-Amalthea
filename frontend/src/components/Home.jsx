import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRoles = [
    { name: 'Admin', path: '/admin', allowedRoles: ['admin'] },
    { name: 'Manager', path: '/manager', allowedRoles: ['manager', 'admin'] },
    { name: 'Employee', path: '/employee', allowedRoles: ['employee', 'manager', 'admin'] }
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
      <nav style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Expense Management System</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Welcome, {user?.username} ({user?.role})</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <section className="homepage">
        <div id="homeintro">
          Welcome! Select your dashboard
        </div>
        <div id="homeoptions">
          <section id="homelist">
            <ul>
              {availableRoles.map((role, index) => (
                <li key={index}>
                  <Link to={role.path}>{role.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

        * {
          font-size: 1.3rem;
          box-sizing: border-box;
          font-family: "Montserrat", sans-serif;
        }

        .home-container {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .homepage {
          margin: 4rem 5rem auto 5rem;
          border: 0.05rem solid #3333333e;
          padding: 1.5rem;
          border-radius: 2rem;
          background-color: white;
        }

        #homeintro {
          text-align: center;
          font-size: 1.5rem;
          margin-bottom: 2rem;
        }

        #homeoptions ul {
          text-align: center;
          list-style: none;
          line-height: 3.7rem;
          padding: 0;
        }

        #homeoptions ul li {
          margin: 1rem 0;
        }

        #homeoptions ul li a {
          text-decoration: none;
          background-color: #333;
          color: whitesmoke;
          border: 0.9rem solid #333;
          border-radius: 5rem;
          width: 300px;
          text-align: center;
          transition: background 0.3s;
          padding: 0 2rem 0 2rem;
          display: inline-block;
        }

        #homeoptions ul li a:hover {
          background-color: #555;
          border-color: #555;
        }

        #homeoptions ul li:first-child a {
          padding-right: 2.7rem;
          padding-left: 2.7rem;
        }

        @media (max-width: 768px) {
          .homepage {
            margin: 2rem 1rem auto 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;