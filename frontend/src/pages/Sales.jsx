import { useState, useEffect } from 'react'
import { Eye, Printer } from 'lucide-react'
import { getSales } from '../api'
import BillReceipt from '../components/BillReceipt'
import { printBill, formatMoney, formatDate } from '../utils/printBill'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [total, setTotal] = useState(0)
  const [selectedSale, setSelectedSale] = useState(null)

  useEffect(() => {
    getSales({ per_page: 50 })
      .then((res) => {
        setSales(res.data.sales)
        setTotal(res.data.total)
      })
      .catch(console.error)
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2>Sales History</h2>
        <p>{total} total transactions</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td style={{ fontWeight: 600 }}>{sale.invoice_number}</td>
                  <td>{formatDate(sale.created_at)}</td>
                  <td>{sale.items.length} items</td>
                  <td>
                    <span className={`badge ${sale.payment_method === 'udhar' ? 'badge-warning' : 'badge-success'}`}>
                      {sale.payment_method}
                    </span>
                    {sale.customer_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {sale.customer_name}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                    {formatMoney(sale.total)}
                  </td>
                  <td className="profit-text">{formatMoney(sale.profit || 0)}</td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => setSelectedSale(sale)}>
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-sm btn-print" onClick={() => printBill(sale)}>
                      <Printer size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No sales yet. Go to New Sale to make your first transaction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <BillReceipt sale={selectedSale} showProfit />
            <div className="modal-actions">
              <button className="btn btn-print" onClick={() => printBill(selectedSale)}>
                <Printer size={18} /> Print Bill
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedSale(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
