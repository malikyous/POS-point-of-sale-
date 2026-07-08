import { useState, useEffect } from 'react'
import { Trash2, CreditCard, Banknote, X, CheckCircle, Printer, Search } from 'lucide-react'
import { getProducts, getCategories, createSale } from '../api'
import BillReceipt from '../components/BillReceipt'
import { printBill, formatMoney } from '../utils/printBill'

export default function POS() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [taxRate] = useState(5)
  const [toast, setToast] = useState(null)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    loadProducts()
    getCategories().then((res) => setCategories(res.data)).catch(console.error)
  }, [search, categoryFilter])

  const loadProducts = () => {
    const params = {}
    if (search) params.search = search
    if (categoryFilter) params.category_id = categoryFilter
    getProducts(params).then((res) => setProducts(res.data)).catch(console.error)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addToCart = (product) => {
    if (product.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('Not enough stock', 'error')
          return prev
        }
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        quantity: 1,
        max_stock: product.stock,
      }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item
        const newQty = item.quantity + delta
        if (newQty <= 0) return item
        if (newQty > item.max_stock) {
          showToast('Not enough stock', 'error')
          return item
        }
        return { ...item, quantity: newQty }
      })
    )
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * taxRate / 100
  const total = subtotal + tax - discount

  const handleCheckout = async () => {
    if (cart.length === 0) return
    try {
      const res = await createSale({
        items: cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        payment_method: paymentMethod,
        discount,
        tax_rate: taxRate,
      })
      setReceipt(res.data)
      setCart([])
      showToast('Sale completed!')
      loadProducts()
    } catch (err) {
      showToast(err.response?.data?.error || 'Checkout failed', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>New Sale</h2>
        <p>Click products to add to cart and checkout</p>
      </div>

      <div className="pos-layout">
        <div className="pos-products">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-pills">
            <button
              className={`category-pill ${!categoryFilter ? 'active' : ''}`}
              onClick={() => setCategoryFilter('')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`category-pill ${categoryFilter == c.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="pos-products-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className={`product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(product)}
              >
                {product.category_name && (
                  <div className="product-cat">{product.category_name}</div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-price">{formatMoney(product.sale_price || product.price)}</div>
                <div className="product-stock">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Search size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>

        <div className="pos-cart">
          <div className="cart-header">
            <span>Order Summary</span>
            <span className="cart-count">{cart.length} items</span>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCartIcon />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>{formatMoney(item.price)} each</p>
                  </div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, 1)}>+</button>
                  </div>
                  <div className="cart-item-total">{formatMoney(item.price * item.quantity)}</div>
                  <button className="qty-btn" onClick={() => removeFromCart(item.product_id)}>
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="form-row">
                <div className="form-group">
                  <label>Discount (Rs.)</label>
                  <input
                    type="number" min="0" step="1"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
              <div className="cart-summary-row"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
              <div className="cart-summary-row"><span>Tax ({taxRate}%)</span><span>{formatMoney(tax)}</span></div>
              {discount > 0 && (
                <div className="cart-summary-row"><span>Discount</span><span>-{formatMoney(discount)}</span></div>
              )}
              <div className="cart-summary-row total">
                <span>Total</span><span>{formatMoney(total)}</span>
              </div>
              <div className="cart-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setCart([])}>
                  <Trash2 size={16} /> Clear
                </button>
                <button className="btn btn-success" onClick={handleCheckout}>
                  {paymentMethod === 'cash' ? <Banknote size={18} /> : <CreditCard size={18} />}
                  Pay {formatMoney(total)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon"><CheckCircle size={32} /></div>
            <BillReceipt sale={receipt} />
            <div className="modal-actions">
              <button className="btn btn-print" onClick={() => printBill(receipt)}>
                <Printer size={18} /> Print Bill
              </button>
              <button className="btn btn-primary" onClick={() => setReceipt(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  )
}

function ShoppingCartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
