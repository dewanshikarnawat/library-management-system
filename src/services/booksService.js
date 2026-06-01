import api from './api.js'

const booksService = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  search: (query) => api.get('/books/search', { params: { q: query } }),
  getByCategory: (category) => api.get('/books/category', { params: { category } }),
  getPopular: () => api.get('/books/popular'),
  getRecent: () => api.get('/books/recent'),
}

export default booksService
