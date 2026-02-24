// Utility Functions for Invoice Generator

const Utils = {
  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (USD, EUR, etc.)
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'USD') {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹',
      NGN: '₦', ZAR: 'R', BRL: 'R$', MXN: 'MX$', CHF: 'CHF',
      CAD: 'C$', AUD: 'A$'
    };

    const symbol = symbols[currency] || currency;

    // For currencies that don't use decimals (JPY)
    if (currency === 'JPY') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }

    return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  /**
   * Parse currency string to number
   * @param {string} str - Currency string
   * @returns {number} Parsed number
   */
  parseCurrency(str) {
    if (!str) return 0;
    // Remove currency symbols, commas, and whitespace
    const cleaned = str.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Format date to ISO string (YYYY-MM-DD)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  /**
   * Get today's date as ISO string
   * @returns {string} Today's date
   */
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Calculate due date from issue date
   * @param {string} issueDate - Issue date
   * @param {number} daysDue - Days until due
   * @returns {string} Due date
   */
  calculateDueDate(issueDate, daysDue = 30) {
    if (!issueDate) return Utils.getTodayDate();
    const date = new Date(issueDate);
    date.setDate(date.getDate() + daysDue);
    return date.toISOString().split('T')[0];
  },

  /**
   * Generate unique ID
   * @returns {string} Unique identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  isValidEmail(email) {
    if (!email) return true; // Empty is allowed
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Is valid phone
   */
  isValidPhone(phone) {
    if (!phone) return true; // Empty is allowed
    // Basic validation - allows various formats
    const re = /^[\d\s\-\+\(\)]{7,20}$/;
    return re.test(phone);
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} Is empty
   */
  isEmpty(obj) {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },

  /**
   * Sanitize string for HTML
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Truncate string to max length
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated string
   */
  truncate(str, maxLength = 50) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  },

  /**
   * Convert file to base64
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  /**
   * Check if file is valid image
   * @param {File} file - File to check
   * @returns {boolean} Is valid image
   */
  isValidImage(file) {
    if (!file) return false;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },

  /**
   * Get file size in KB
   * @param {File} file - File to check
   * @returns {number} Size in KB
   */
  getFileSizeKB(file) {
    return Math.round(file.size / 1024);
  }
};

// Export for use in other modules
window.Utils = Utils;
