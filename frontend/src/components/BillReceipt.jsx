import { formatMoney, formatDate } from '../utils/printBill'

export default function BillReceipt({ sale, showProfit = false }) {
  if (!sale) return null

  return (
    <div className="bill-receipt">
      <div className="bill-header">
        <h3>POS Store</h3>
        <p>Main Bazaar, City</p>
        <p className="bill-invoice">{sale.invoice_number}</p>
        <p className="bill-date">{formatDate(sale.created_at)}</p>
      </div>
                          
      <div className="bill-items">
        {sale.items.map((item) => (
          <div key={item.id} className="bill-item">
            <div className="bill-item-name">
              <span>{item.product_name}</span>
              <span className="bill-item-qty">x{item.quantity}</span>
            </div>
            <div className="bill-item-prices">
              <span className="muted">{formatMoney(item.unit_price)} each</span>
              <span>{formatMoney(item.total_price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bill-summary">
        <div className="bill-row"><span>Subtotal</span><span>{formatMoney(sale.subtotal)}</span></div>
        {sale.tax > 0 && <div className="bill-row"><span>Tax</span><span>{formatMoney(sale.tax)}</span></div>}
        {sale.discount > 0 && <div className="bill-row"><span>Discount</span><span>-{formatMoney(sale.discount)}</span></div>}
        <div className="bill-row bill-total"><span>Total</span><span>{formatMoney(sale.total)}</span></div>
        {showProfit && sale.profit != null && (
          <div className="bill-row bill-profit"><span>Profit</span><span>{formatMoney(sale.profit)}</span></div>
        )}
        <div className="bill-payment">Payment: {sale.payment_method}</div>
      </div>
    </div>
  )
}
