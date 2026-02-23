// Export Module for Invoice Generator

const Export = {
  /**
   * Print invoice using browser print
   */
  print() {
    window.print();
  },

  /**
   * Download invoice as PDF file
   * @param {Object} invoiceData - Invoice data to export
   */
  async downloadPDF(invoiceData = null) {
    try {
      // Show loading indicator
      app.showToast('Generating PDF...', 'info');
      
      const element = document.getElementById('invoice-preview');
      
      // Use html2canvas to capture the invoice element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Get image data
      const imgData = canvas.toDataURL('image/png');
      
      // Initialize jsPDF
      const { jsPDF } = window.jspdf;
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Get invoice number for filename
      const data = invoiceData || this.getInvoiceData();
      const invoiceNum = data.invoiceNumber || 'invoice';
      
      // Save PDF
      pdf.save(`invoice-${invoiceNum}.pdf`);
      
      app.showToast('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      app.showToast('Failed to generate PDF', 'error');
    }
  },

  /**
   * Download invoice as HTML file
   * @param {Object} invoiceData - Invoice data to export
   */
  downloadHTML(invoiceData = null) {
    const data = invoiceData || this.getInvoiceData();
    const html = this.generateHTML(data);
    this.downloadFile(html, `invoice-${data.invoiceNumber || 'export'}.html`, 'text/html');
  },

  /**
   * Generate standalone HTML from invoice data
   * @param {Object} data - Invoice data
   * @returns {string} HTML string
   */
  generateHTML(data) {
    const currency = data.currency || 'USD';
    const lineItems = data.lineItems || [];
    
    let lineItemsHTML = '';
    lineItems.forEach(item => {
      const calc = Calculator.calculateLineItem(item.quantity, item.price, item.taxRate);
      lineItemsHTML += `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">${Utils.escapeHtml(item.description)}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${Utils.formatCurrency(item.price, currency)}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.taxRate}%</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${Utils.formatCurrency(calc.total, currency)}</td>
        </tr>
      `;
    });

    const totals = Calculator.calculateAll(lineItems);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber || ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); padding: 40px; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1e293b; }
    .invoice-title { font-size: 32px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.1em; }
    .invoice-meta { text-align: right; }
    .meta-row { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 8px; }
    .meta-label { color: #64748b; font-weight: 500; }
    .meta-value { font-weight: 400; }
    .company-logo { max-width: 120px; max-height: 80px; object-fit: contain; }
    .invoice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    .address-block { font-size: 14px; line-height: 1.6; }
    .address-name { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
    .line-items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .line-items-table th { background: #f1f5f9; font-weight: 600; font-size: 12px; text-transform: uppercase; padding: 12px 8px; text-align: left; border-bottom: 2px solid #1e293b; }
    .totals-section { display: flex; justify-content: flex-end; }
    .totals-table { width: 250px; border-collapse: collapse; }
    .totals-table td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .totals-table td:last-child { text-align: right; }
    .totals-table .grand-total { font-size: 20px; font-weight: 700; color: #2563eb; border-top: 2px solid #1e293b; padding-top: 12px; margin-top: 8px; }
    .notes { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .notes-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .notes-content { font-size: 14px; color: #64748b; white-space: pre-wrap; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { background: white; padding: 0; } .invoice-container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div>
        ${data.logo ? `<img src="${data.logo}" alt="Logo" class="company-logo">` : ''}
        <div style="margin-top: 16px;">
          <div class="address-name">${Utils.escapeHtml(data.companyName)}</div>
          <div class="address-block" style="white-space: pre-line;">${Utils.escapeHtml(data.companyAddress)}</div>
          ${data.companyEmail ? `<div>${Utils.escapeHtml(data.companyEmail)}</div>` : ''}
          ${data.companyPhone ? `<div>${Utils.escapeHtml(data.companyPhone)}</div>` : ''}
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">Invoice</div>
        <div style="margin-top: 12px;">
          <div class="meta-row"><span class="meta-label">Invoice #:</span><span class="meta-value">${Utils.escapeHtml(data.invoiceNumber || '')}</span></div>
          <div class="meta-row"><span class="meta-label">Date:</span><span class="meta-value">${data.issueDate || ''}</span></div>
          <div class="meta-row"><span class="meta-label">Due:</span><span class="meta-value">${data.dueDate || ''}</span></div>
        </div>
      </div>
    </div>

    <div class="invoice-grid">
      <div>
        <div class="section-title">Bill To</div>
        <div class="address-name">${Utils.escapeHtml(data.clientName)}</div>
        <div class="address-block" style="white-space: pre-line;">${Utils.escapeHtml(data.clientAddress)}</div>
        ${data.clientEmail ? `<div>${Utils.escapeHtml(data.clientEmail)}</div>` : ''}
        ${data.clientPhone ? `<div>${Utils.escapeHtml(data.clientPhone)}</div>` : ''}
      </div>
    </div>

    <table class="line-items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: center;">Tax</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHTML}
      </tbody>
    </table>

    <div class="totals-section">
      <table class="totals-table">
        <tr><td>Subtotal</td><td>${Utils.formatCurrency(totals.subtotal, currency)}</td></tr>
        <tr><td>Tax</td><td>${Utils.formatCurrency(totals.taxTotal, currency)}</td></tr>
        <tr class="grand-total"><td>Total</td><td>${Utils.formatCurrency(totals.grandTotal, currency)}</td></tr>
      </table>
    </div>

    ${data.notes ? `
    <div class="notes">
      <div class="notes-title">Notes & Terms</div>
      <div class="notes-content">${Utils.escapeHtml(data.notes)}</div>
    </div>
    ` : ''}

    <div class="footer">
      Thank you for your business!
    </div>
  </div>
</body>
</html>`;
  },

  /**
   * Download file to user's computer
   * @param {string} content - File content
   * @param {string} filename - Filename
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Copy invoice data to clipboard as formatted text
   * @param {Object} data - Invoice data
   */
  async copyToClipboard(data) {
    const text = this.generatePlainText(data);
    
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },

  /**
   * Generate plain text version of invoice
   * @param {Object} data - Invoice data
   * @returns {string} Plain text
   */
  generatePlainText(data) {
    const currency = data.currency || 'USD';
    const lineItems = data.lineItems || [];
    
    let text = `INVOICE\n`;
    text += `${'='.repeat(40)}\n\n`;
    text += `Invoice #: ${data.invoiceNumber || 'N/A'}\n`;
    text += `Date: ${data.issueDate || 'N/A'}\n`;
    text += `Due: ${data.dueDate || 'N/A'}\n\n`;

    text += `FROM:\n${data.companyName || 'N/A'}\n`;
    if (data.companyAddress) text += `${data.companyAddress}\n`;
    if (data.companyEmail) text += `${data.companyEmail}\n`;
    if (data.companyPhone) text += `${data.companyPhone}\n\n`;

    text += `BILL TO:\n${data.clientName || 'N/A'}\n`;
    if (data.clientAddress) text += `${data.clientAddress}\n`;
    if (data.clientEmail) text += `${data.clientEmail}\n`;
    if (data.clientPhone) text += `${data.clientPhone}\n\n`;

    text += `ITEMS:\n${'-'.repeat(40)}\n`;
    lineItems.forEach(item => {
      const calc = Calculator.calculateLineItem(item.quantity, item.price, item.taxRate);
      text += `${item.description}\n`;
      text += `  ${item.quantity} x ${Utils.formatCurrency(item.price, currency)} = ${Utils.formatCurrency(calc.total, currency)}\n\n`;
    });

    const totals = Calculator.calculateAll(lineItems);
    text += `${'-'.repeat(40)}\n`;
    text += `Subtotal: ${Utils.formatCurrency(totals.subtotal, currency)}\n`;
    text += `Tax: ${Utils.formatCurrency(totals.taxTotal, currency)}\n`;
    text += `TOTAL: ${Utils.formatCurrency(totals.grandTotal, currency)}\n`;

    if (data.notes) {
      text += `\nNOTES:\n${data.notes}\n`;
    }

    return text;
  },

  /**
   * Get invoice data from form/UI
   * @returns {Object} Invoice data
   */
  getInvoiceData() {
    const data = {
      invoiceNumber: document.getElementById('invoice-number')?.value || '',
      issueDate: document.getElementById('issue-date')?.value || '',
      dueDate: document.getElementById('due-date')?.value || '',
      currency: document.getElementById('currency')?.value || 'USD',
      companyName: document.getElementById('company-name')?.value || '',
      companyAddress: document.getElementById('company-address')?.value || '',
      companyEmail: document.getElementById('company-email')?.value || '',
      companyPhone: document.getElementById('company-phone')?.value || '',
      clientName: document.getElementById('client-name')?.value || '',
      clientAddress: document.getElementById('client-address')?.value || '',
      clientEmail: document.getElementById('client-email')?.value || '',
      clientPhone: document.getElementById('client-phone')?.value || '',
      notes: document.getElementById('notes')?.value || '',
      logo: this.getLogoData()
    };

    // Get line items
    const lineItems = [];
    const rows = document.querySelectorAll('#line-items-body tr');
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      if (inputs.length >= 4) {
        lineItems.push({
          id: row.dataset.id || Utils.generateId(),
          description: inputs[0].value || '',
          quantity: inputs[1].value || 0,
          price: inputs[2].value || 0,
          taxRate: inputs[3].value || 0
        });
      }
    });

    data.lineItems = lineItems;
    return data;
  },

  /**
   * Get logo data URL
   * @returns {string|null} Logo data URL
   */
  getLogoData() {
    const img = document.querySelector('#logo-preview img');
    return img ? img.src : null;
  }
};

// Export for use in other modules
window.Export = Export;
