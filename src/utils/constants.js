export const ISSUE_DURATION_DAYS = 14
export const FINE_PER_DAY = 5 // in rupees
export const MAX_BOOKS_PER_MEMBER = 3
export const APP_NAME = 'LMS'
export const APP_FULL_NAME = 'Library Management System'
export const APP_VERSION = '1.0.0'

export const ROLES = { ADMIN: 'admin', MEMBER: 'member' }

export const BOOK_CATEGORIES = [
  'Technology', 'Fiction', 'History', 'Science', 'Self-Help',
  'Finance', 'Psychology', 'Biography', 'Philosophy', 'Mathematics',
]

export const STATUS_COLORS = {
  available: 'success',
  unavailable: 'danger',
  issued: 'info',
  overdue: 'danger',
  returned: 'success',
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
}