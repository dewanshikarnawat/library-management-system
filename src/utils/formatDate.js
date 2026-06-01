export function toDateISO(date = new Date()) {
  return date.toISOString().split('T')[0]
}

export function addDaysISO(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toDateISO(d)
}

export function daysBetweenISO(fromStr, toStr) {
  const from = new Date(fromStr)
  const to = new Date(toStr)
  return Math.max(1, Math.ceil((to - from) / (1000 * 60 * 60 * 24)))
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function daysUntilDue(dueDateStr) {
  if (!dueDateStr) return null
  const diff = new Date(dueDateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false
  return new Date(dueDateStr) < new Date()
}

export function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}