import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [filters]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.data.expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      startDate: '',
      endDate: ''
    });
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
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        marginBottom: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Meals">Meals</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Transportation">Transportation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={clearFilters}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          textAlign: 'center',
          color: '#666'
        }}>
          No expenses found
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Employee</th>
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
                  <td style={{ padding: '1rem' }}>{expense.employee.username}</td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>{expense.category}</td>
                  <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {expense.description}
                  </td>
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

      {/* Approval Rules Placeholder */}
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', color: '#666', marginTop: '2rem' }}>
        <h2>Approval Rules</h2>
        <p>Approval rules management coming soon.</p>
        {/* Implement CRUD for approval rules here */}
      </div>
    </div>
  );
};

export default ExpenseList;