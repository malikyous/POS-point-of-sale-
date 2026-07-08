const STORE_NAME = 'Malik Super Store'
const STORE_ADDRESS = 'Model Town MultanS'
const STORE_PHONE = '+92 3039042363'

function formatMoney(amount) {
  return `Rs. ${Number(amount).toFixed(2)}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function printBill(sale) {
  const itemsHtml = sale.items.map((item) => `
    <tr>
      <td>${item.product_name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatMoney(item.unit_price)}</td>
      <td style="text-align:right">${formatMoney(item.total_price)}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Bill - ${sale.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; padding: 20px; max-width: 320px; margin: 0 auto; color: #111; }
    .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 12px; margin-bottom: 12px; }
    .header h1 { font-size: 18px; margin-bottom: 4px; }
    .header p { font-size: 11px; color: #444; line-height: 1.5; }
    .meta { font-size: 11px; margin-bottom: 12px; }
    .meta div { display: flex; justify-content: space-between; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
    th { border-bottom: 1px solid #333; padding: 4px 2px; text-align: left; font-size: 10px; }
    td { padding: 4px 2px; vertical-align: top; }
    .totals { border-top: 2px dashed #333; padding-top: 8px; font-size: 12px; }
    .totals div { display: flex; justify-content: space-between; margin: 3px 0; }
    .grand-total { font-size: 16px; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 1px solid #333; }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #555; border-top: 1px dashed #333; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${STORE_NAME}</h1>
    <p>${STORE_ADDRESS}<br>${STORE_PHONE}</p>
  </div>
  <div class="meta">
    <div><span>Invoice:</span><strong>${sale.invoice_number}</strong></div>
    <div><span>Date:</span><span>${formatDate(sale.created_at)}</span></div>
    <div><span>Payment:</span><span>${sale.payment_method.toUpperCase()}</span></div>
    ${sale.customer_name ? `<div><span>Customer:</span><span>${sale.customer_name}</span></div>` : ''}
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Amt</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatMoney(sale.subtotal)}</span></div>
    ${sale.tax > 0 ? `<div><span>Tax</span><span>${formatMoney(sale.tax)}</span></div>` : ''}
    ${sale.discount > 0 ? `<div><span>Discount</span><span>-${formatMoney(sale.discount)}</span></div>` : ''}
    <div class="grand-total"><span>TOTAL</span><span>${formatMoney(sale.total)}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for shopping!</p>
    <p>Please visit again</p>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) {
    alert('Please allow popups to print the bill')
    return
  }
  win.document.write(html)
  win.document.close()
}

export { formatMoney, formatDate }
