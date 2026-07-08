import { useState, useEffect } from 'react'
import {
  Plus, Eye, Wallet, Phone, User, ArrowDownCircle, ArrowUpCircle, BookOpen
} from 'lucide-react'
import {
  getCustomers, createCustomer, getCustomerLedger, receivePayment
} from '../api'
import { formatMoney, formatDate } from '../utils/printBill'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [totalUdhar, setTotalUdhar] = useState(0)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [ledger, setLedger] = useState([])
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [toast, setToast] = useState(null)

  useEffect(() => { loadCustomers() }, [search])

  const loadCustomers = () => {
    const params = search ? { search } : {}
    getCustomers(params).then((res) => {
      setCustomers(res.data.customers)
      setTotalUdhar(res.data.total_udhar)
    }).catch(console.error)
  }

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      await createCustomer(form)
      setShowAddModal(false)
      setForm({ name: '', phone: '', address: '' })
      showToast('Customer added')
      loadCustomers()
    } catch (err) {
      showToast(err.response?.data?.error || 'Error', 'error')
    }
  }

  const openLedger = async (customer) => {
    setSelectedCustomer(customer)
    setPaymentAmount('')
    setPaymentNote('')
    const res = await getCustomerLedger(customer.id)
    setLedger(res.data)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) return
    try {
      const res = await receivePayment(selectedCustomer.id, {
        amount,
        description: paymentNote || 'Payment received',
      })
      showToast('Payment received!')
      setPaymentAmount('')
      setPaymentNote('')
      setSelectedCustomer(res.data.customer)
      setLedger([res.data.entry, ...ledger])
      loadCustomers()
    } catch (err) {
      showToast(err.response?.data?.error || 'Payment failed', 'error')
    }
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Customer Khata</h2>
          <p>Udhar accounts — track who owes how much</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon orange"><Wallet size={24} /></div>
          <div className="stat-info">
            <h3>{formatMoney(totalUdhar)}</h3>
            <p>Total Udhar (Receivable)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><User size={24} /></div>
          <div className="stat-info">
            <h3>{customers.filter((c) => c.balance > 0).length}</h3>
            <p>Customers with Udhar</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><BookOpen size={24} /></div>
          <div className="stat-info">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Udhar Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.address || '-'}
                  </td>
                  <td>
                    <span className={`badge ${c.balance > 0 ? 'badge-warning' : 'badge-success'}`}
                      style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      {formatMoney(c.balance)}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openLedger(c)}>
                      <Eye size={14} /> Khata
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customers yet. Add a customer to start khata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Customer</h3>
            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="khata-header">
              <div>
                <h3>{selectedCustomer.name}</h3>
                <p>{selectedCustomer.phone && <><Phone size={12} /> {selectedCustomer.phone}</>}</p>
              </div>
              <div className="khata-balance">
                <span>Current Udhar</span>
                <strong>{formatMoney(selectedCustomer.balance)}</strong>
              </div>
            </div>

            {selectedCustomer.balance > 0 && (
              <form onSubmit={handlePayment} className="payment-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Receive Payment (Rs.)</label>
                    <input type="number" min="0" step="1" value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Amount" required />
                  </div>
                  <div className="form-group">
                    <label>Note</label>
                    <input value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Optional note" />
                  </div>
                </div>
                <button type="submit" className="btn btn-success btn-sm">
                  <ArrowDownCircle size={16} /> Receive Payment
                </button>
              </form>
            )}

            <h4 style={{ margin: '1.25rem 0 0.75rem', fontWeight: 700 }}>Khata History</h4>
            <div className="ledger-list">
              {ledger.map((entry) => (
                <div key={entry.id} className={`ledger-item ${entry.entry_type}`}>
                  <div className="ledger-icon">
                    {entry.entry_type === 'udhar'
                      ? <ArrowUpCircle size={18} color="#d97706" />
                      : <ArrowDownCircle size={18} color="#059669" />}
                  </div>
                  <div className="ledger-info">
                    <strong>{entry.description}</strong>
                    <span>{formatDate(entry.created_at)}</span>
                    {entry.invoice_number && <span className="ledger-invoice">{entry.invoice_number}</span>}
                  </div>
                  <div className="ledger-amount">
                    <span className={entry.entry_type === 'udhar' ? 'udhar-amount' : 'payment-amount'}>
                      {entry.entry_type === 'udhar' ? '+' : '-'}{formatMoney(entry.amount)}
                    </span>
                    <span className="ledger-balance">Bal: {formatMoney(entry.balance_after)}</span>
                  </div>
                </div>
              ))}
              {ledger.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                  No transactions yet
                </p>
              )}
            </div>
        
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  )
}
