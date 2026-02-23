// Local Storage Module for Invoice Generator

const Storage = {
  STORAGE_KEY: 'invoice_data',
  SETTINGS_KEY: 'invoice_settings',
  CLIENTS_KEY: 'saved_clients',
  INVOICES_KEY: 'saved_invoices',
  CURRENT_KEY: 'current_invoice_exists',

  /**
   * Get user-specific key suffix
   */
  getUserId() {
    const session = Auth.getSession();
    return session ? session.userId : 'guest';
  },

  /**
   * Get user-specific storage key
   */
  getUserKey(baseKey) {
    return `${baseKey}_${this.getUserId()}`;
  },

  /**
   * Save invoice data to local storage
   * @param {Object} data - Invoice data to save
   * @returns {boolean} Success status
   */
  saveInvoice(data) {
    try {
      const existing = this.getInvoice();
      const invoiceData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        // Merge with existing data
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(invoiceData));
      } else {
        // Create new
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          ...invoiceData,
          createdAt: new Date().toISOString()
        }));
      }

      return true;
    } catch (error) {
      console.error('Failed to save invoice:', error);
      return false;
    }
  },

  /**
   * Get invoice data from local storage
   * @returns {Object|null} Invoice data or null
   */
  getInvoice() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get invoice:', error);
      return null;
    }
  },

  /**
   * Clear invoice data from local storage
   * @returns {boolean} Success status
   */
  clearInvoice() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear invoice:', error);
      return false;
    }
  },

  /**
   * Check if invoice data exists
   * @returns {boolean} Has data
   */
  hasInvoice() {
    return !!this.getInvoice();
  },

  /**
   * Save settings/preferences
   * @param {Object} settings - Settings to save
   * @returns {boolean} Success status
   */
  saveSettings(settings) {
    try {
      const existing = this.getSettings();
      const merged = { ...existing, ...settings, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  },

  /**
   * Get settings
   * @returns {Object} Settings or default
   */
  getSettings() {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      if (!data) return this.getDefaultSettings();
      return { ...this.getDefaultSettings(), ...JSON.parse(data) };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.getDefaultSettings();
    }
  },

  /**
   * Default settings
   * @returns {Object} Default settings
   */
  getDefaultSettings() {
    return {
      currency: 'USD',
      defaultTaxRate: 0,
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      notes: 'Payment is due within 30 days of invoice date.',
      logo: null
    };
  },

  /**
   * Export invoice as JSON file
   * @param {Object} invoiceData - Invoice data to export
   */
  exportAsJSON(invoiceData) {
    const dataStr = JSON.stringify(invoiceData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Import invoice from JSON file
   * @param {File} file - JSON file to import
   * @returns {Promise<Object>} Parsed invoice data
   */
  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  /**
   * Get storage usage info
   * @returns {Object} Storage info
   */
  getStorageInfo() {
    let total = 0;
    const items = {};

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        items[key] = {
          size: item.length * 2, // Approximate bytes (UTF-16)
          sizeKB: Math.round(item.length / 1024)
        };
        total += item.length * 2;
      }
    }

    return {
      totalBytes: total,
      totalKB: Math.round(total / 1024),
      items
    };
  },

  // ========== CLIENT MANAGEMENT ==========

  /**
   * Get all saved clients
   * @returns {Array} Array of saved clients
   */
  getClients() {
    try {
      const data = localStorage.getItem(this.CLIENTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get clients:', error);
      return [];
    }
  },

  /**
   * Save a new client
   * @param {Object} client - Client data
   * @returns {Object} Saved client with ID
   */
  saveClient(client) {
    try {
      const clients = this.getClients();
      const newClient = {
        ...client,
        id: Utils.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      clients.push(newClient);
      localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(clients));
      return newClient;
    } catch (error) {
      console.error('Failed to save client:', error);
      return null;
    }
  },

  /**
   * Update an existing client
   * @param {string} id - Client ID
   * @param {Object} clientData - Updated client data
   * @returns {boolean} Success status
   */
  updateClient(id, clientData) {
    try {
      const clients = this.getClients();
      const index = clients.findIndex(c => c.id === id);
      if (index === -1) return false;
      
      clients[index] = {
        ...clients[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(clients));
      return true;
    } catch (error) {
      console.error('Failed to update client:', error);
      return false;
    }
  },

  /**
   * Delete a client
   * @param {string} id - Client ID
   * @returns {boolean} Success status
   */
  deleteClient(id) {
    try {
      const clients = this.getClients().filter(c => c.id !== id);
      localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(clients));
      return true;
    } catch (error) {
      console.error('Failed to delete client:', error);
      return false;
    }
  },

  /**
   * Get a single client by ID
   * @param {string} id - Client ID
   * @returns {Object|null} Client data
   */
  getClient(id) {
    const clients = this.getClients();
    return clients.find(c => c.id === id) || null;
  },

  // ========== INVOICE HISTORY ==========

  /**
   * Get all saved invoices (history)
   * @returns {Array} Array of saved invoices
   */
  getInvoiceHistory() {
    try {
      const data = localStorage.getItem(this.INVOICES_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get invoice history:', error);
      return [];
    }
  },

  /**
   * Save an invoice to history
   * @param {Object} invoice - Invoice data
   * @returns {Object} Saved invoice with ID
   */
  saveInvoiceToHistory(invoice) {
    try {
      const history = this.getInvoiceHistory();
      const savedInvoice = {
        ...invoice,
        id: Utils.generateId(),
        status: invoice.status || 'draft',
        savedAt: new Date().toISOString()
      };
      history.push(savedInvoice);
      localStorage.setItem(this.INVOICES_KEY, JSON.stringify(history));
      return savedInvoice;
    } catch (error) {
      console.error('Failed to save invoice to history:', error);
      return null;
    }
  },

  /**
   * Get invoices for a specific client
   * @param {string} clientName - Client name
   * @returns {Array} Array of invoices for the client
   */
  getClientInvoices(clientName) {
    const history = this.getInvoiceHistory();
    return history.filter(inv => inv.clientName === clientName);
  },

  /**
   * Delete an invoice from history
   * @param {string} id - Invoice ID
   * @returns {boolean} Success status
   */
  deleteInvoiceFromHistory(id) {
    try {
      const history = this.getInvoiceHistory().filter(inv => inv.id !== id);
      localStorage.setItem(this.INVOICES_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Failed to delete invoice from history:', error);
      return false;
    }
  },

  /**
   * Update invoice status
   * @param {string} id - Invoice ID
   * @param {string} status - New status
   * @returns {boolean} Success status
   */
  updateInvoiceStatus(id, status) {
    try {
      const history = this.getInvoiceHistory();
      const index = history.findIndex(inv => inv.id === id);
      if (index === -1) return false;
      
      history[index].status = status;
      history[index].updatedAt = new Date().toISOString();
      localStorage.setItem(this.INVOICES_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      return false;
    }
  },

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Object|null} Invoice data
   */
  getInvoiceById(id) {
    const history = this.getInvoiceHistory();
    return history.find(inv => inv.id === id) || null;
  },

  /**
   * Generate next invoice number
   * @returns {string} New invoice number
   */
  generateInvoiceNumber() {
    const history = this.getInvoiceHistory();
    const year = new Date().getFullYear();
    const count = history.filter(inv => inv.invoiceNumber && inv.invoiceNumber.includes(year)).length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  },

  // ========== CURRENT INVOICE TRACKING ==========

  CURRENT_KEY: 'current_invoice_exists',

  /**
   * Check if there's an unsaved current invoice
   * @returns {boolean}
   */
  hasCurrentInvoice() {
    return localStorage.getItem(this.CURRENT_KEY) === 'true';
  },

  /**
   * Set current invoice exists flag
   * @param {boolean} exists
   */
  setCurrentInvoiceExists(exists) {
    localStorage.setItem(this.CURRENT_KEY, exists ? 'true' : 'false');
  },

  /**
   * Auto-save with debouncing
   * @param {Object} data - Data to save
   * @param {number} delay - Debounce delay in ms
   */
  autoSave(data, delay = 1000) {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveInvoice(data);
      this.setCurrentInvoiceExists(true);
    }, delay);
  }
};

// Export for use in other modules
window.Storage = Storage;
