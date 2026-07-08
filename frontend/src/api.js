import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const getProducts = (params) => api.get('/products', { params })
export const scanProduct = (code) => api.get(`/products/scan/${encodeURIComponent(code)}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

export const getCategories = () => api.get('/categories')
export const createCategory = (data) => api.post('/categories', data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

export const getSales = (params) => api.get('/sales', { params })
export const createSale = (data) => api.post('/sales', data)

export const getCustomers = (params) => api.get('/customers', { params })
export const createCustomer = (data) => api.post('/customers', data)
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data)
export const getCustomerLedger = (id) => api.get(`/customers/${id}/ledger`)
export const receivePayment = (id, data) => api.post(`/customers/${id}/payment`, data)

export const getDashboardStats = () => api.get('/dashboard/stats')
export const getLowStock = () => api.get('/dashboard/low-stock')

export default api
