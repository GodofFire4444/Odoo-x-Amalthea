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
    category: 'Other',
    description: ''
  };

  try {
    // Extract amount (common patterns: $XX.XX, XX.XX, Total: XX.XX)
    const amountPatterns = [
      /total[:\s]+\$?(\d+\.?\d*)/i,
      /amount[:\s]+\$?(\d+\.?\d*)/i,
      /\$(\d+\.\d{2})/,
      /(\d+\.\d{2})/
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.amount = parseFloat(match[1]);
        break;
      }
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
          break;
        }
      }
    }

    // Extract merchant name (usually in first few lines)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      result.merchant = lines[0].trim();
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
        break;
      }
    }

    // Create description from merchant and amount
    if (result.merchant && result.amount) {
      result.description = `${result.merchant} - $${result.amount}`;
    } else {
      result.description = text.substring(0, 100);
    }

  } catch (error) {
    console.error('Error parsing receipt text:', error);
  }

  return result;
};

module.exports = {
  parseReceiptText
};