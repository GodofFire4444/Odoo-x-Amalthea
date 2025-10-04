import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmployeeList from './EmployeeList';
import ApprovalRules from './ApprovalRules';
import ExpenseList from './ExpenseList';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employees');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingExpenses: 0,
    totalExpenses: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
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
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Welcome, {user?.username}</span>
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

      <div style={{ padding: '2rem' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Total Employees</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalEmployees}</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Pending Expenses</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.pendingExpenses}</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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