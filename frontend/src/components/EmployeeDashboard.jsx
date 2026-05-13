import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ExpenseForm from './ExpenseForm';
import OCRScanner from './OCRScanner';
import AppHeader from './AppHeader';
import { useToast } from '../context/ToastContext';

const EmployeeDashboard = () => {
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ocrExpenseData, setOcrExpenseData] = useState(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/expenses');
      setExpenses(response.data.data.expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      const message = error.response?.data?.message || 'Unable to load expenses';
      setError(message);
      addToast({ type: 'error', title: 'Expenses failed to load', message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleExpenseSubmit = () => {
    setShowExpenseForm(false);
    setOcrExpenseData(null);
    loadExpenses();
  };

  const handleOCRComplete = (expenseData) => {
    setShowOCRScanner(false);
    setOcrExpenseData(expenseData);
    setShowExpenseForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  const counts = expenses.reduce((accumulator, expense) => {
    accumulator[expense.status] = (accumulator[expense.status] || 0) + 1;
    return accumulator;
  }, { pending: 0, approved: 0, rejected: 0 });

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppHeader title="Employee Dashboard" subtitle="Submit & track expenses" />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.86)', padding: '1rem 1.1rem', borderRadius: '1rem', border: '1px solid var(--demo-border)' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700 }}>Total expenses</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{expenses.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.86)', padding: '1rem 1.1rem', borderRadius: '1rem', border: '1px solid var(--demo-border)' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700 }}>Pending</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>{counts.pending}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.86)', padding: '1rem 1.1rem', borderRadius: '1rem', border: '1px solid var(--demo-border)' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700 }}>Approved</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d' }}>{counts.approved}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => {
              setOcrExpenseData(null);
              setShowExpenseForm(true);
            }}
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

        {error ? (
          <div style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '0.75rem',
            backgroundColor: '#fdecea',
            color: '#b42318',
            border: '1px solid #f5c2c7'
          }}>
            {error}
          </div>
        ) : null}

        {loading ? (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e5e5' }}>
            Loading your expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.86)',
            padding: '3rem',
            borderRadius: '1.5rem',
            textAlign: 'center',
            color: '#666',
            border: '1px solid var(--demo-border)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No expenses yet.</div>
            <div style={{ marginTop: '0.4rem' }}>Submit your first expense or scan a receipt to show the workflow.</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.86)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--demo-border)', boxShadow: 'var(--demo-shadow)' }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;