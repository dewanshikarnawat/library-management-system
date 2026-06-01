import api from './api.js'

const membersService = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getIssuedBooks: (id) => api.get(`/members/${id}/issues`),
  promoteToAdmin: (id, password) =>
    api.put(`/members/${id}/promote-admin`, password ? { password } : {}),
}

export default membersService
