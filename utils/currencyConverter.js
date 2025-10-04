const axios = require('axios');

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    // If same currency, return original amount
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Fetch exchange rates
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    if (!response.data || !response.data.rates) {
      throw new Error('Unable to fetch exchange rates');
    }

    const rate = response.data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const convertedAmount = amount * rate;
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error('Failed to convert currency');
  }
};

/**
 * Get all available currencies
 * @returns {Promise<Object>} Object with currency codes and rates
 */
const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
};

module.exports = {
  convertCurrency,
  getExchangeRates
};