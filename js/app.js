// Main Application for Invoice Generator

const app = {
  // Line items array
  lineItems: [],
  
  // Current currency
  currency: 'USD',

  // Current invoice ID (for tracking)
  currentInvoiceId: null,

  /**
   * Initialize the application
   */
  init() {
    // Check if we need to load a specific invoice from history
    this.checkForHistoryLoad();
    
    // Check for page reload with existing invoice
    this.checkForExistingInvoice();
    
    // Set default dates
    this.setDefaultDates();
    
    // Generate new invoice number for fresh start
    this.generateNewInvoiceNumber();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Add initial line item
    if (this.lineItems.length === 0) {
      this.addLineItem();
    }

    console.log('Invoice Generator initialized');
  },

  /**
   * Check if we need to load a specific invoice from history
   */
  checkForHistoryLoad() {
    const loadId = localStorage.getItem('load_invoice_id');
    if (loadId) {
      localStorage.removeItem('load_invoice_id');
      const invoice = Storage.getInvoiceById(loadId);
      if (invoice) {
        this.populateForm(invoice);
        Storage.setCurrentInvoiceExists(true);
        this.showToast('Invoice loaded from history', 'success');
      }
    }
  },

  /**
   * Check for existing invoice on page load
   */
  checkForExistingInvoice() {
    // Check if there's a saved invoice and user is coming back (not first visit)
    if (Storage.hasCurrentInvoice() && Storage.getInvoice()) {
      // Show the resume popup
      setTimeout(() => {
        document.getElementById('reload-modal').classList.add('active');
      }, 500);
    } else {
      // First visit - clear any existing data for fresh start
      Storage.setCurrentInvoiceExists(false);
      Storage.clearInvoice();
    }
  },

  /**
   * Resume the existing invoice
   */
  resumeInvoice() {
    this.closeModal('reload-modal');
    this.loadSavedData();
    this.showToast('Invoice restored', 'success');
  },

  /**
   * Discard existing and start fresh
   */
  discardInvoice() {
    Storage.clearInvoice();
    Storage.setCurrentInvoiceExists(false);
    this.closeModal('reload-modal');
    
    // Reset form
    this.lineItems = [];
    document.getElementById('invoice-form').reset();
    this.removeLogo();
    this.setDefaultDates();
    this.generateNewInvoiceNumber();
    this.addLineItem();
    this.updateTotals();
    
    this.showToast('Started fresh invoice', 'success');
  },

  /**
   * Generate new invoice number
   */
  generateNewInvoiceNumber() {
    const invoiceNum = Storage.generateInvoiceNumber();
    document.getElementById('invoice-number').value = invoiceNum;
  },

  /**
   * Set default dates (today and 30 days from now)
   */
  setDefaultDates() {
    const issueDateInput = document.getElementById('issue-date');
    const dueDateInput = document.getElementById('due-date');
    const today = Utils.getTodayDate();
    const dueDate = Utils.calculateDueDate(today, 30);

    if (!issueDateInput.value) {
      issueDateInput.value = today;
    }
    if (!dueDateInput.value) {
      dueDateInput.value = dueDate;
    }
  },

  /**
   * Load saved data from local storage
   */
  loadSavedData() {
    const saved = Storage.getInvoice();
    if (saved) {
      this.populateForm(saved);
      this.showToast('Invoice loaded from saved data', 'success');
    }
  },

  /**
   * Populate form with data
   * @param {Object} data - Invoice data
   */
  populateForm(data) {
    // Set ID for tracking
    this.currentInvoiceId = data.id || null;
    
    // Set basic fields
    this.setValue('invoice-number', data.invoiceNumber);
    this.setValue('issue-date', data.issueDate);
    this.setValue('due-date', data.dueDate);
    this.setValue('currency', data.currency || 'USD');
    this.setValue('company-name', data.companyName);
    this.setValue('company-address', data.companyAddress);
    this.setValue('company-email', data.companyEmail);
    this.setValue('company-phone', data.companyPhone);
    this.setValue('client-name', data.clientName);
    this.setValue('client-address', data.clientAddress);
    this.setValue('client-email', data.clientEmail);
    this.setValue('client-phone', data.clientPhone);
    this.setValue('notes', data.notes);
    
    // Set status
    if (data.status) {
      this.setValue('invoice-status', data.status);
    }

    // Set logo
    if (data.logo) {
      this.setLogo(data.logo);
    }

    // Set line items
    if (data.lineItems && Array.isArray(data.lineItems)) {
      this.lineItems = data.lineItems;
      this.renderLineItems();
    }

    this.updateTotals();
    this.updateCurrency();
  },

  /**
   * Set input value helper
   */
  setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value) {
      el.value = value;
    }
  },

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Auto-save on any input change
    const formInputs = document.querySelectorAll('#invoice-form input, #invoice-form textarea, #invoice-form select');
    formInputs.forEach(input => {
      input.addEventListener('input', Utils.debounce(() => this.saveData(), 500));
      input.addEventListener('change', Utils.debounce(() => this.saveData(), 500));
    });

    // Line item input changes
    document.getElementById('line-items-body').addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT') {
        this.updateLineItemTotals();
        this.saveData();
      }
    });

    // Currency change
    document.getElementById('currency').addEventListener('change', () => {
      this.updateCurrency();
      this.saveData();
    });
  },

  /**
   * Save current data to local storage
   */
  saveData() {
    const data = Export.getInvoiceData();
    Storage.saveInvoice(data);
    this.updateSaveStatus('Saved');
  },

  /**
   * Save as draft to history
   */
  saveAsDraft() {
    const data = Export.getInvoiceData();
    data.status = 'draft';
    
    if (this.currentInvoiceId) {
      // Update existing
      Storage.updateInvoiceStatus(this.currentInvoiceId, 'draft');
    } else {
      // Save new to history
      const saved = Storage.saveInvoiceToHistory(data);
      this.currentInvoiceId = saved.id;
    }
    
    Storage.setCurrentInvoiceExists(true);
    this.showToast('Invoice saved as draft', 'success');
  },

  /**
   * Update invoice status
   */
  updateStatus() {
    const status = document.getElementById('invoice-status').value;
    
    if (this.currentInvoiceId) {
      Storage.updateInvoiceStatus(this.currentInvoiceId, status);
      this.showToast(`Status updated to ${status}`, 'success');
    }
  },

  /**
   * Duplicate current invoice
   */
  duplicateInvoice() {
    const data = Export.getInvoiceData();
    
    // Generate new invoice number
    data.invoiceNumber = Storage.generateInvoiceNumber();
    data.id = null;
    data.status = 'draft';
    
    // Populate form with new data
    this.populateForm(data);
    
    // Generate new ID for tracking
    this.currentInvoiceId = null;
    
    this.showToast('Invoice duplicated with new number', 'success');
  },

  /**
   * Update save status indicator
   */
  updateSaveStatus(status) {
    const el = document.getElementById('save-status');
    if (el) {
      el.textContent = status;
      setTimeout(() => {
        el.textContent = 'All changes saved';
      }, 2000);
    }
  },

  /**
   * Add a new line item
   */
  addLineItem() {
    const item = {
      id: Utils.generateId(),
      description: '',
      quantity: 1,
      price: 0,
      taxRate: 0
    };
    this.lineItems.push(item);
    this.renderLineItems();
    this.updateTotals();
  },

  /**
   * Render line items table
   */
  renderLineItems() {
    const tbody = document.getElementById('line-items-body');
    tbody.innerHTML = '';

    this.lineItems.forEach((item, index) => {
      const calc = Calculator.calculateLineItem(item.quantity, item.price, item.taxRate);
      
      const row = document.createElement('tr');
      row.className = 'line-item-row';
      row.dataset.id = item.id;
      
      row.innerHTML = `
        <td class="description-col">
          <input type="text" class="form-input" placeholder="Item description" value="${Utils.escapeHtml(item.description)}" data-field="description">
        </td>
        <td class="qty-col">
          <input type="number" class="form-input" placeholder="1" value="${item.quantity}" min="0" step="1" data-field="quantity">
        </td>
        <td class="price-col">
          <input type="number" class="form-input" placeholder="0.00" value="${item.price}" min="0" step="0.01" data-field="price">
        </td>
        <td class="tax-col">
          <input type="number" class="form-input" placeholder="0" value="${item.taxRate}" min="0" max="100" step="0.1" data-field="taxRate">
        </td>
        <td class="total-col">
          <span class="total-cell" data-field="total">${Utils.formatCurrency(calc.total, this.currency)}</span>
        </td>
        <td class="actions-col no-print">
          <button type="button" class="btn btn-icon btn-danger" onclick="app.removeLineItem('${item.id}')" title="Remove item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  },

  /**
   * Update individual line item totals
   */
  updateLineItemTotals() {
    const rows = document.querySelectorAll('#line-items-body tr');
    
    rows.forEach(row => {
      const id = row.dataset.id;
      const inputs = row.querySelectorAll('input');
      const totalCell = row.querySelector('[data-field="total"]');
      
      const description = inputs[0].value;
      const quantity = parseFloat(inputs[1].value) || 0;
      const price = parseFloat(inputs[2].value) || 0;
      const taxRate = parseFloat(inputs[3].value) || 0;

      // Update item in array
      const itemIndex = this.lineItems.findIndex(item => item.id === id);
      if (itemIndex >= 0) {
        this.lineItems[itemIndex] = {
          ...this.lineItems[itemIndex],
          description,
          quantity,
          price,
          taxRate
        };
      }

      // Update display
      const calc = Calculator.calculateLineItem(quantity, price, taxRate);
      if (totalCell) {
        totalCell.textContent = Utils.formatCurrency(calc.total, this.currency);
      }
    });

    this.updateTotals();
  },

  /**
   * Remove a line item
   * @param {string} id - Item ID to remove
   */
  removeLineItem(id) {
    if (this.lineItems.length <= 1) {
      this.showToast('At least one item is required', 'error');
      return;
    }

    this.lineItems = this.lineItems.filter(item => item.id !== id);
    this.renderLineItems();
    this.updateTotals();
    this.saveData();
    this.showToast('Item removed', 'success');
  },

  /**
   * Update grand totals
   */
  updateTotals() {
    const totals = Calculator.calculateAll(this.lineItems);
    
    document.getElementById('subtotal').textContent = Utils.formatCurrency(totals.subtotal, this.currency);
    document.getElementById('tax-total').textContent = Utils.formatCurrency(totals.taxTotal, this.currency);
    document.getElementById('grand-total').textContent = Utils.formatCurrency(totals.grandTotal, this.currency);
  },

  /**
   * Update currency and refresh displays
   */
  updateCurrency() {
    this.currency = document.getElementById('currency').value;
    this.renderLineItems();
    this.updateTotals();
  },

  /**
   * Handle logo upload
   * @param {Event} event - Change event
   */
  async handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate
    if (!Utils.isValidImage(file)) {
      this.showToast('Please select a valid image file (PNG, JPG, GIF, WebP)', 'error');
      return;
    }

    const sizeKB = Utils.getFileSizeKB(file);
    if (sizeKB > 2048) {
      this.showToast('Image size must be less than 2MB', 'error');
      return;
    }

    try {
      const base64 = await Utils.fileToBase64(file);
      this.setLogo(base64);
      this.saveData();
      this.showToast('Logo uploaded successfully', 'success');
    } catch (error) {
      this.showToast('Failed to upload logo', 'error');
    }
  },

  /**
   * Set logo preview
   * @param {string} src - Image source
   */
  setLogo(src) {
    const preview = document.getElementById('logo-preview');
    const removeBtn = document.getElementById('remove-logo-btn');
    
    preview.innerHTML = `<img src="${src}" alt="Logo">`;
    removeBtn.style.display = 'inline-flex';
  },

  /**
   * Remove logo
   */
  removeLogo() {
    const preview = document.getElementById('logo-preview');
    const removeBtn = document.getElementById('remove-logo-btn');
    const input = document.getElementById('company-logo');
    
    preview.innerHTML = `<span class="logo-placeholder">Logo</span>`;
    removeBtn.style.display = 'none';
    input.value = '';
    
    this.saveData();
    this.showToast('Logo removed', 'success');
  },

  /**
   * Print invoice
   */
  printInvoice() {
    this.saveData();
    Export.print();
    this.showToast('Print dialog opened', 'info');
  },

  /**
   * Download invoice as PDF
   */
  downloadPDF() {
    const data = Export.getInvoiceData();
    const status = document.getElementById('invoice-status').value;
    
    // Save to invoice history if it has client and items
    if (data.clientName && data.grandTotal > 0) {
      if (this.currentInvoiceId) {
        // Update existing
        Storage.updateInvoiceStatus(this.currentInvoiceId, status);
      } else {
        // Save new to history
        data.status = status;
        const saved = Storage.saveInvoiceToHistory(data);
        this.currentInvoiceId = saved.id;
      }
      Storage.setCurrentInvoiceExists(false);
    }
    
    Export.downloadPDF(data);
  },

  // ========== CLIENT MANAGEMENT ==========

  /**
   * Open client management modal
   */
  openClientModal() {
    this.renderClientsList();
    this.clearClientForm();
    document.getElementById('client-modal').classList.add('active');
  },

  /**
   * Render the clients list
   */
  renderClientsList() {
    const clients = Storage.getClients();
    const container = document.getElementById('clients-list');
    
    if (clients.length === 0) {
      container.innerHTML = '<div class="empty-state-small">No saved clients yet. Add a client using the form above.</div>';
      return;
    }

    container.innerHTML = clients.map(client => `
      <div class="client-item" data-id="${client.id}">
        <div class="client-info" onclick="app.selectClient('${client.id}')">
          <div class="client-name">${Utils.escapeHtml(client.name)}</div>
          <div class="client-email">${Utils.escapeHtml(client.email || 'No email')}</div>
        </div>
        <div class="client-actions">
          <button type="button" class="btn btn-secondary btn-sm" onclick="app.editClient('${client.id}')" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="app.viewClientHistory('${client.id}')" title="View History">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
          <button type="button" class="btn btn-danger btn-sm" onclick="app.deleteClient('${client.id}')" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  /**
   * Save a client from the form
   */
  saveClient() {
    const name = document.getElementById('client-form-name').value.trim();
    const email = document.getElementById('client-form-email').value.trim();
    const address = document.getElementById('client-form-address').value.trim();
    const phone = document.getElementById('client-form-phone').value.trim();

    if (!name) {
      this.showToast('Client name is required', 'error');
      return;
    }

    const clientData = { name, email, address, phone };
    const editId = document.getElementById('client-form-name').dataset.editId;

    if (editId) {
      // Update existing client
      Storage.updateClient(editId, clientData);
      this.showToast('Client updated successfully', 'success');
    } else {
      // Save new client
      Storage.saveClient(clientData);
      this.showToast('Client saved successfully', 'success');
    }

    this.clearClientForm();
    this.renderClientsList();
  },

  /**
   * Clear the client form
   */
  clearClientForm() {
    document.getElementById('client-form-name').value = '';
    document.getElementById('client-form-email').value = '';
    document.getElementById('client-form-address').value = '';
    document.getElementById('client-form-phone').value = '';
    document.getElementById('client-form-name').removeAttribute('data-edit-id');
    document.getElementById('cancel-edit-btn').style.display = 'none';
  },

  /**
   * Edit an existing client
   */
  editClient(id) {
    const client = Storage.getClient(id);
    if (!client) return;

    document.getElementById('client-form-name').value = client.name;
    document.getElementById('client-form-name').dataset.editId = id;
    document.getElementById('client-form-email').value = client.email || '';
    document.getElementById('client-form-address').value = client.address || '';
    document.getElementById('client-form-phone').value = client.phone || '';
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
  },

  /**
   * Delete a client
   */
  deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
      Storage.deleteClient(id);
      this.renderClientsList();
      this.showToast('Client deleted', 'success');
    }
  },

  /**
   * Select a client and fill the invoice form
   */
  selectClient(id) {
    const client = Storage.getClient(id);
    if (!client) return;

    document.getElementById('client-name').value = client.name || '';
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-phone').value = client.phone || '';

    this.closeModal('client-modal');
    this.saveData();
    this.showToast(`Client "${client.name}" selected`, 'success');
  },

  /**
   * View client invoice history
   */
  viewClientHistory(id) {
    const client = Storage.getClient(id);
    if (!client) return;

    const invoices = Storage.getClientInvoices(client.name);
    const container = document.getElementById('client-history-list');
    const section = document.getElementById('client-history-section');

    section.style.display = 'block';

    if (invoices.length === 0) {
      container.innerHTML = '<div class="empty-state-small">No invoices found for this client.</div>';
      return;
    }

    container.innerHTML = invoices.map(inv => {
      const totals = Calculator.calculateAll(inv.lineItems || []);
      return `
        <div class="invoice-history-item">
          <div class="invoice-history-info">
            <span class="invoice-history-number">${Utils.escapeHtml(inv.invoiceNumber || 'N/A')}</span>
            <span class="invoice-history-date">${inv.issueDate || 'No date'}</span>
          </div>
          <span class="invoice-history-amount">${Utils.formatCurrency(totals.grandTotal, inv.currency || 'USD')}</span>
        </div>
      `;
    }).join('');
  },

  /**
   * Open select client modal
   */
  openSelectClientModal() {
    const clients = Storage.getClients();
    const container = document.getElementById('select-client-list');

    if (clients.length === 0) {
      container.innerHTML = '<div class="empty-state-small">No saved clients. Add clients from the Clients button.</div>';
    } else {
      container.innerHTML = clients.map(client => `
        <div class="client-item" style="cursor: pointer;" onclick="app.selectClientFromModal('${client.id}')">
          <div class="client-info">
            <div class="client-name">${Utils.escapeHtml(client.name)}</div>
            <div class="client-email">${Utils.escapeHtml(client.email || 'No email')}</div>
          </div>
        </div>
      `).join('');
    }

    document.getElementById('select-client-modal').classList.add('active');
  },

  /**
   * Select client from modal
   */
  selectClientFromModal(id) {
    this.selectClient(id);
    this.closeModal('select-client-modal');
  },

  /**
   * Save current invoice to history
   */
  saveInvoiceToHistory() {
    const data = Export.getInvoiceData();
    if (data.clientName && data.grandTotal > 0) {
      Storage.saveInvoiceToHistory(data);
    }
  },

  /**
   * Clear invoice (show confirmation)
   */
  clearInvoice() {
    document.getElementById('clear-modal').classList.add('active');
  },

  /**
   * Confirm clear invoice
   */
  confirmClear() {
    Storage.clearInvoice();
    this.lineItems = [];
    document.getElementById('invoice-form').reset();
    this.removeLogo();
    this.setDefaultDates();
    this.addLineItem();
    this.updateTotals();
    this.closeModal('clear-modal');
    this.showToast('Invoice cleared', 'success');
  },

  /**
   * Close modal
   * @param {string} id - Modal ID
   */
  closeModal(id) {
    document.getElementById(id).classList.remove('active');
  },

  /**
   * Show toast notification
   * @param {string} message - Message to show
   * @param {string} type - Message type (success, error, info)
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button type="button" class="toast-close" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  },

  /**
   * Load sample data for demo
   */
  loadSampleData() {
    const sampleData = {
      invoiceNumber: 'INV-2024-001',
      issueDate: Utils.getTodayDate(),
      dueDate: Utils.calculateDueDate(Utils.getTodayDate(), 30),
      currency: 'USD',
      companyName: 'Acme Services Inc.',
      companyAddress: '123 Business Avenue\nNew York, NY 10001\nUnited States',
      companyEmail: 'billing@acmeservices.com',
      companyPhone: '+1 (555) 123-4567',
      clientName: 'John Smith',
      clientAddress: '456 Client Street\nLos Angeles, CA 90001\nUnited States',
      clientEmail: 'john@clientcompany.com',
      clientPhone: '+1 (555) 987-6543',
      notes: 'Payment Terms: Net 30\n\nThank you for your business! We appreciate your prompt payment.',
      lineItems: [
        { id: Utils.generateId(), description: 'Web Development Services - Homepage', quantity: 1, price: 1500, taxRate: 10 },
        { id: Utils.generateId(), description: 'Web Development Services - Contact Page', quantity: 1, price: 800, taxRate: 10 },
        { id: Utils.generateId(), description: 'Logo Design', quantity: 1, price: 500, taxRate: 10 },
        { id: Utils.generateId(), description: 'Domain Registration (1 year)', quantity: 1, price: 50, taxRate: 0 },
        { id: Utils.generateId(), description: 'Web Hosting (1 month)', quantity: 1, price: 29, taxRate: 0 }
      ]
    };

    this.populateForm(sampleData);
    this.saveData();
    this.showToast('Sample data loaded', 'success');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Export app for global access
window.app = app;
