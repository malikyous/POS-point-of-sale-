import { useState, useEffect } from 'react'
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Wallet } from 'lucide-react'
import { getDashboardStats, getLowStock } from '../api'
import { formatMoney } from '../utils/printBill'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    getDashboardStats().then((res) => setStats(res.data)).catch(console.error)
    getLowStock().then((res) => setLowStock(res.data)).catch(console.error)
  }, [])

  if (!stats) {
    return <div className="page-header"><h2>Dashboard</h2><p>Loading...</p></div>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Store performance overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><DollarSign size={24} /></div>
          <div className="stat-info">
            <h3>{formatMoney(stats.today_revenue)}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>{formatMoney(stats.today_profit || 0)}</h3>
            <p>Today's Profit</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><ShoppingBag size={24} /></div>
          <div className="stat-info">
            <h3>{stats.today_orders}</h3>
            <p>Today's Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><Package size={24} /></div>
          <div className="stat-info">
            <h3>{stats.total_products}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>{stats.low_stock_count}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Wallet size={24} /></div>
          <div className="stat-info">
            <h3>{formatMoney(stats.total_udhar || 0)}</h3>
            <p>Total Udhar</p>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Low Stock Alert</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Cost</th>
                  <th>Sale Price</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="cost-text">{formatMoney(p.cost_price)}</td>
                    <td>{formatMoney(p.sale_price || p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
