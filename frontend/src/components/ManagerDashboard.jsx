import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingExpenses();
  }, []);

  const loadPendingExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/pending/approvals');
      setPendingExpenses(response.data.data.expenses);
    } catch (error) {
      console.error('Error loading pending expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId, action) => {
    const comment = prompt(`Add a comment for ${action}:`);
    
    try {
      await api.post(`/approvals/expenses/${expenseId}`, {
        action,
        comment
      });
      
      alert(`Expense ${action} successfully!`);
      loadPendingExpenses();
    } catch (error) {
      console.error('Error processing expense:', error);
      alert(error.response?.data?.message || 'Error processing expense');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <nav style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Manager Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Welcome, {user?.username}</span>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            Home
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Pending Approvals</h2>

        {loading ? (
          <p>Loading...</p>
        ) : pendingExpenses.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#666'
          }}>
            No pending approvals at this time.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingExpenses.map((expense) => (
              <div
                key={expense._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px'
                }}
              >
                <div style={{ display: 'flex', flex: 1, gap: '32px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>
                      Employee
                    </span>
                    <span style={{ fontSize: '15px', color: '#000', fontWeight: 600 }}>
                      {expense.employee.username}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>
                      Category
                    </span>
                    <span style={{ fontSize: '15px', color: '#000', fontWeight: 600 }}>
                      {expense.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>
                      Amount
                    </span>
                    <span style={{ fontSize: '15px', color: '#000', fontWeight: 600 }}>
                      {expense.currency} {expense.amount.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>
                      Date
                    </span>
                    <span style={{ fontSize: '15px', color: '#000', fontWeight: 600 }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 500, textTransform: 'uppercase' }}>
                      Description
                    </span>
                    <span style={{ fontSize: '14px', color: '#000' }}>
                      {expense.description}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleApproval(expense._id, 'approved')}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: '#000',
                      color: '#fff'
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleApproval(expense._id, 'rejected')}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: '#f5f5f5',
                      color: '#000'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;