// Invoice Calculator Module

const Calculator = {
  /**
   * Calculate line item total
   * @param {number} quantity - Item quantity
   * @param {number} price - Item price
   * @param {number} taxRate - Tax rate percentage
   * @returns {Object} Line total and tax amount
   */
  calculateLineItem(quantity, price, taxRate = 0) {
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    const tax = parseFloat(taxRate) || 0;

    const subtotal = qty * prc;
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total
    };
  },

  /**
   * Calculate all line items
   * @param {Array} lineItems - Array of line items
   * @returns {Object} Calculated totals
   */
  calculateAll(lineItems) {
    let subtotal = 0;
    let taxTotal = 0;

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return {
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        items: []
      };
    }

    const calculatedItems = lineItems.map(item => {
      const calc = this.calculateLineItem(item.quantity, item.price, item.taxRate);
      subtotal += calc.subtotal;
      taxTotal += calc.taxAmount;

      return {
        ...item,
        subtotal: calc.subtotal,
        taxAmount: calc.taxAmount,
        total: calc.total
      };
    });

    const grandTotal = subtotal + taxTotal;

    return {
      subtotal: subtotal,
      taxTotal: taxTotal,
      grandTotal: grandTotal,
      items: calculatedItems
    };
  },

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted number
   */
  formatNumber(num, decimals = 2) {
    if (isNaN(num) || !isFinite(num)) return '0.00';
    return num.toFixed(decimals);
  },

  /**
   * Round to nearest cent
   * @param {number} num - Number to round
   * @returns {number} Rounded number
   */
  roundToCent(num) {
    return Math.round(num * 100) / 100;
  },

  /**
   * Calculate discount
   * @param {number} amount - Original amount
   * @param {number} discountPercent - Discount percentage
   * @returns {Object} Discount amount and final amount
   */
  calculateDiscount(amount, discountPercent) {
    const discount = amount * (discountPercent / 100);
    const final = amount - discount;

    return {
      original: amount,
      discount: discount,
      final: final,
      discountPercent: discountPercent
    };
  },

  /**
   * Calculate shipping
   * @param {number} amount - Order amount
   * @param {number} shippingCost - Fixed shipping cost
   * @param {number} shippingPercent - Percentage-based shipping
   * @returns {number} Total shipping cost
   */
  calculateShipping(amount, shippingCost = 0, shippingPercent = 0) {
    const fixed = parseFloat(shippingCost) || 0;
    const percent = parseFloat(shippingPercent) || 0;
    return fixed + (amount * (percent / 100));
  },

  /**
   * Calculate exchange rate (placeholder - would need API)
   * @param {number} amount - Amount in original currency
   * @param {number} rate - Exchange rate
   * @returns {number} Converted amount
   */
  convertCurrency(amount, rate) {
    const r = parseFloat(rate) || 1;
    return amount * r;
  }
};

// Export for use in other modules
window.Calculator = Calculator;
