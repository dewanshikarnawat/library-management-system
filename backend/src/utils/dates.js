import { FINE_PER_DAY } from '../config/constants.js'

export function formatDateISO(date = new Date()) {
  return date.toISOString().split('T')[0]
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return formatDateISO(d)
}

export function daysBetween(startStr, endStr) {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diff = end - start
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function computeFine(dueDate, returnDate = formatDateISO()) {
  const overdueDays = daysBetween(dueDate, returnDate)
  if (overdueDays <= 0) return 0
  return overdueDays * FINE_PER_DAY
}

export function deriveIssueStatus(dueDate, returnDate, currentStatus) {
  if (returnDate || currentStatus === 'returned') return 'returned'
  const today = formatDateISO()
  if (today > dueDate) return 'overdue'
  return 'issued'
}
