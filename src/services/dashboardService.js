import api from './api.js'

const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getMonthly: () => api.get('/dashboard/monthly'),
  getCategories: () => api.get('/dashboard/categories'),
  getActivity: () => api.get('/dashboard/activity'),
  getNotifications: () => api.get('/dashboard/notifications'),
}

export default dashboardService
