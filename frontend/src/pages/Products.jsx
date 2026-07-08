import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../api'
import { formatMoney } from '../utils/printBill'

const emptyForm = { name: '', sku: '', cost_price: '', sale_price: '', stock: '', category_id: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadData() }, [search])

  const loadData = () => {
    const params = search ? { search } : {}
    getProducts(params).then((res) => setProducts(res.data)).catch(console.error)
    getCategories().then((res) => setCategories(res.data)).catch(console.error)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name,
      sku: product.sku,
      cost_price: product.cost_price,
      sale_price: product.sale_price || product.price,
      stock: product.stock,
      category_id: product.category_id || '',
    })
    setShowModal(true)
  }

  const calcMargin = () => {
    const cost = parseFloat(form.cost_price) || 0
    const sale = parseFloat(form.sale_price) || 0
    if (sale <= 0) return 0
    return (((sale - cost) / sale) * 100).toFixed(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      name: form.name,
      sku: form.sku,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price),
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    }
    try {
      if (editing) {
        await updateProduct(editing.id, data)
        showToast('Product updated')
      } else {
        await createProduct(data)
        showToast('Product created')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      showToast(err.response?.data?.error || 'Error saving product', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return
    try {
      await deleteProduct(id)
      showToast('Product deactivated')
      loadData()
    } catch {
      showToast('Error deleting product', 'error')
    }
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Products</h2>
          <p>Manage cost price, sale price & inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU / QR</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Sale Price</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <div className="sku-qr-cell">
                      <span className="badge badge-info">{p.sku}</span>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(p.sku)}`}
                        alt={`QR ${p.sku}`}
                        className="product-qr"
                        title={`Scan: ${p.sku}`}
                      />
                    </div>
                  </td>
                  <td>{p.category_name || '-'}</td>
                  <td className="cost-text">{formatMoney(p.cost_price)}</td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(p.sale_price || p.price)}</td>
                  <td>
                    <span className="profit-text">
                      <TrendingUp size={12} style={{ display: 'inline', marginRight: 2 }} />
                      {p.profit_margin}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.stock <= 10 ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)} style={{ marginRight: '0.5rem' }}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price (Rs.)</label>
                  <input type="number" step="0.01" min="0" value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sale Price (Rs.) *</label>
                  <input type="number" step="0.01" min="0" value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })} required />
                </div>
              </div>
              {(form.cost_price || form.sale_price) && (
                <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, marginBottom: '1rem' }}>
                  Profit Margin: {calcMargin()}%
                </p>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  )
}
