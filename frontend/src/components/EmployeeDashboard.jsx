import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ExpenseForm from './ExpenseForm';
import OCRScanner from './OCRScanner';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ocrExpenseData, setOcrExpenseData] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses');
      setExpenses(response.data.data.expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = () => {
    setShowExpenseForm(false);
    loadExpenses();
  };

  const handleOCRComplete = (expenseData) => {
    setShowOCRScanner(false);
    setOcrExpenseData(expenseData);
    setShowExpenseForm(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
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
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Employee Dashboard</h1>
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
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowExpenseForm(true)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            + Submit Expense
          </button>
          <button
            onClick={() => setShowOCRScanner(true)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            📷 Scan Receipt
          </button>
        </div>

        {/* Modals */}
        {showExpenseForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <ExpenseForm
                onSubmit={handleExpenseSubmit}
                onCancel={() => { setShowExpenseForm(false); setOcrExpenseData(null); }}
                initialData={ocrExpenseData}
              />
            </div>
          </div>
        )}

        {showOCRScanner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <OCRScanner
                onComplete={handleOCRComplete}
                onCancel={() => setShowOCRScanner(false)}
              />
            </div>
          </div>
        )}

        {/* Expenses List */}
        <h2 style={{ marginBottom: '1.5rem' }}>My Expenses</h2>

        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#666'
          }}>
            No expenses yet. Submit your first expense!
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense._id} style={{
                    borderBottom: index < expenses.length - 1 ? '1px solid #e5e5e5' : 'none'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>{expense.category}</td>
                    <td style={{ padding: '1rem' }}>{expense.description}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                      {expense.currency} {expense.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: getStatusColor(expense.status) + '20',
                        color: getStatusColor(expense.status)
                      }}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;