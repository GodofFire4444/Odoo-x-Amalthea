import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DEFAULT_FORM_DATA = {
  amount: '',
  currency: 'USD',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  merchant: ''
};

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Entertainment', 'Accommodation', 'Transportation', 'Other'];

const normalizeDate = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? fallback : parsedDate.toISOString().split('T')[0];
};

const normalizeCurrency = (value, fallback) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const currency = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : fallback;
};

const mergeExpenseData = (currentData, incomingData) => {
  if (!incomingData) {
    return currentData;
  }

  return {
    ...currentData,
    amount: incomingData.amount !== undefined && incomingData.amount !== null && incomingData.amount !== ''
      ? String(incomingData.amount)
      : currentData.amount,
    currency: normalizeCurrency(incomingData.currency, currentData.currency),
    category: CATEGORIES.includes(incomingData.category) ? incomingData.category : currentData.category,
    description: typeof incomingData.description === 'string' && incomingData.description.trim()
      ? incomingData.description
      : currentData.description,
    date: normalizeDate(incomingData.date, currentData.date),
    merchant: typeof incomingData.merchant === 'string' && incomingData.merchant.trim()
      ? incomingData.merchant
      : currentData.merchant,
  };
};

const ExpenseForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => mergeExpenseData(prev, initialData));
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

      setCurrencies(Array.from(new Set([...DEFAULT_CURRENCIES, ...currencySet])).sort());
    } catch (error) {
      console.error('Error loading currencies:', error);
      setCurrencies(DEFAULT_CURRENCIES);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number.parseFloat(formData.amount);
    const selectedDate = new Date(formData.date);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      addToast({ type: 'warning', title: 'Check the amount', message: 'Expense amount must be greater than zero.' });
      return;
    }

    if (!formData.currency || !/^[A-Z]{3}$/.test(formData.currency)) {
      setError('Please choose a valid 3-letter currency code.');
      addToast({ type: 'warning', title: 'Check the currency', message: 'Choose a valid 3-letter currency code.' });
      return;
    }

    if (!CATEGORIES.includes(formData.category)) {
      setError('Please choose a valid expense category.');
      addToast({ type: 'warning', title: 'Category required', message: 'Pick a valid expense category before submitting.' });
      return;
    }

    if (Number.isNaN(selectedDate.getTime())) {
      setError('Please choose a valid date.');
      addToast({ type: 'warning', title: 'Check the date', message: 'Choose a valid expense date.' });
      return;
    }

    if (!String(formData.description).trim()) {
      setError('Please enter an expense description.');
      addToast({ type: 'warning', title: 'Description required', message: 'Add a short description before submitting.' });
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/expenses', {
        ...formData,
        amount,
        currency: formData.currency.toUpperCase(),
        category: formData.category,
        description: formData.description.trim(),
        date: selectedDate.toISOString().split('T')[0]
      });
      addToast({ type: 'success', title: 'Expense submitted', message: 'Your expense is now in the workflow.' });
      onSubmit();
    } catch (error) {
      console.error('Error submitting expense:', error);
      setError(error.response?.data?.message || 'Error submitting expense');
      addToast({
        type: 'error',
        title: 'Submission failed',
        message: error.response?.data?.message || 'Unable to submit the expense right now.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Submit Expense</h2>

      {initialData?.missingFields?.length ? (
        <div style={{
          marginBottom: '1rem',
          padding: '0.85rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: '#fff8e1',
          color: '#8a6d3b',
          border: '1px solid #ffe0a3'
        }}>
          OCR filled what it could. Please review the fields below before submitting.
        </div>
      ) : null}

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
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
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