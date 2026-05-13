import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import EmployeeList from './EmployeeList';
import ApprovalRules from './ApprovalRules';
import ExpenseList from './ExpenseList';
import AppHeader from './AppHeader';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingExpenses: 0,
    totalExpenses: 0
  });

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [usersRes, expensesRes] = await Promise.all([
        api.get('/users'),
        api.get('/expenses')
      ]);

      const expenses = expensesRes.data.data.expenses;
      setStats({
        totalEmployees: usersRes.data.data.users.length,
        pendingExpenses: expenses.filter(e => e.status === 'pending').length,
        totalExpenses: expenses.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      const message = error.response?.data?.message || 'Unable to load dashboard data';
      setError(message);
      addToast({ type: 'error', title: 'Dashboard load failed', message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppHeader title="Admin Dashboard" subtitle="System settings & oversight" />

      <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            background: 'rgba(255,255,255,0.78)',
            border: '1px solid var(--demo-border)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: 'var(--demo-shadow)'
          }}>
            Loading dashboard metrics...
          </div>
        ) : null}

        {error ? (
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.9rem 1rem',
            borderRadius: '1rem',
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        ) : null}

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.82)',
            padding: '1.5rem',
            borderRadius: '1.5rem',
            border: '1px solid var(--demo-border)',
            boxShadow: 'var(--demo-shadow)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Total Employees</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalEmployees}</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.82)',
            padding: '1.5rem',
            borderRadius: '1.5rem',
            border: '1px solid var(--demo-border)',
            boxShadow: 'var(--demo-shadow)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Pending Expenses</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.pendingExpenses}</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.82)',
            padding: '1.5rem',
            borderRadius: '1.5rem',
            border: '1px solid var(--demo-border)',
            boxShadow: 'var(--demo-shadow)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Total Expenses</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>{stats.totalExpenses}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e5e5'
        }}>
          {['employees', 'expenses', 'approval-rules'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #333' : 'none',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '1rem',
                textTransform: 'capitalize'
              }}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'employees' && <EmployeeList onUpdate={loadStats} />}
          {activeTab === 'expenses' && <ExpenseList />}
          {activeTab === 'approval-rules' && <ApprovalRules />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;