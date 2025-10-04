import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ExpenseForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrencies();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const loadCurrencies = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries = await response.json();
      
      const currencySet = new Set();
      countries.forEach(country => {
        if (country.currencies) {
          Object.keys(country.currencies).forEach(code => currencySet.add(code));
        }
      });

      setCurrencies([...currencySet].sort());
    } catch (error) {
      console.error('Error loading currencies:', error);
      setCurrencies(['USD', 'EUR', 'GBP', 'INR', 'JPY']);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.description || !formData.date) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      alert('Expense submitted successfully!');
      onSubmit();
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert(error.response?.data?.message || 'Error submitting expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Submit Expense</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Amount *
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Currency *
        </label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        >
          {currencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Category *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        >
          <option value="">Select Category</option>
          <option value="Travel">Travel</option>
          <option value="Meals">Meals</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Accommodation">Accommodation</option>
          <option value="Transportation">Transportation</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Merchant
        </label>
        <input
          type="text"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          placeholder="e.g., Starbucks, Uber, Delta Airlines"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="3"
          placeholder="Describe the expense..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;