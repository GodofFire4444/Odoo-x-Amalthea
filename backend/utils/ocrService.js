/**
 * Parse OCR text to extract expense information
 * This function processes text extracted from receipts/invoices
 * @param {string} text - OCR extracted text
 * @returns {Object} Parsed expense data
 */
const parseReceiptText = (text) => {
  const result = {
    amount: null,
    date: null,
    merchant: null,
    currency: null,
    category: 'Other',
    description: '',
    confidence: {
      amount: false,
      date: false,
      merchant: false,
      currency: false,
      category: false,
      overall: 0
    },
    missingFields: []
  };

  const normalizeCurrency = (rawText) => {
    const upperText = rawText.toUpperCase();
    if (upperText.includes('€') || upperText.includes('EUR')) return 'EUR';
    if (upperText.includes('£') || upperText.includes('GBP')) return 'GBP';
    if (upperText.includes('₹') || upperText.includes('INR')) return 'INR';
    if (upperText.includes('¥') || upperText.includes('JPY')) return 'JPY';
    if (upperText.includes('$') || upperText.includes('USD') || upperText.includes('US$')) return 'USD';
    return null;
  };

  try {
    // Extract amount (common patterns: $XX.XX, XX.XX, Total: XX.XX)
    const amountPatterns = [
      /total[:\s]+[\$€£₹¥]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
      /amount[:\s]+[\$€£₹¥]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
      /[\$€£₹¥]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.amount = parseFloat(match[1].replace(/,/g, ''));
        result.confidence.amount = Number.isFinite(result.amount);
        break;
      }
    }

    const detectedCurrency = normalizeCurrency(text);
    if (detectedCurrency) {
      result.currency = detectedCurrency;
      result.confidence.currency = true;
    }

    // Extract date (various formats)
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{2,4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        const parsedDate = new Date(match[0]);
        if (!isNaN(parsedDate.getTime())) {
          result.date = parsedDate.toISOString().split('T')[0];
          result.confidence.date = true;
          break;
        }
      }
    }

    // Extract merchant name (usually in first few lines)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      result.merchant = lines[0].trim();
      result.confidence.merchant = true;
    }

    // Determine category based on keywords
    const categoryKeywords = {
      'Travel': ['flight', 'airline', 'airport', 'travel', 'uber', 'lyft', 'taxi', 'cab'],
      'Meals': ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'lunch', 'dinner', 'breakfast'],
      'Accommodation': ['hotel', 'motel', 'inn', 'lodging', 'airbnb'],
      'Office Supplies': ['office', 'supplies', 'staples', 'depot', 'paper', 'pen'],
      'Transportation': ['gas', 'fuel', 'parking', 'toll', 'metro', 'bus', 'train'],
      'Entertainment': ['cinema', 'movie', 'theatre', 'entertainment', 'event']
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        result.category = category;
        result.confidence.category = true;
        break;
      }
    }

    // Create description from merchant and amount
    if (result.merchant && result.amount) {
      result.description = `${result.merchant} - $${result.amount}`;
    } else {
      result.description = text.substring(0, 100);
    }

    result.missingFields = ['amount', 'date', 'merchant', 'currency'].filter((field) => !result[field]);
    const recognizedFields = ['amount', 'date', 'merchant', 'currency', 'category'].filter((field) => result[field]);
    result.confidence.overall = Math.round((recognizedFields.length / 5) * 100);

  } catch (error) {
    console.error('Error parsing receipt text:', error);
  }

  return result;
};

module.exports = {
  parseReceiptText
};