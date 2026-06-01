import api from './api.js'

const issuesService = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  issueBook: (bookId, memberId, { dueDate } = {}) =>
    api.post('/issues', { bookId, memberId, ...(dueDate && { dueDate }) }),
  returnBook: (id) => api.put(`/issues/${id}/return`),
  getOverdue: () => api.get('/issues/overdue'),
  getHistory: () => api.get('/issues/history'),
}

export default issuesService
