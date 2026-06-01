export function toId(value) {
  if (value == null) return ''
  if (typeof value === 'object') return String(value._id || value.id || '')
  return String(value)
}

export function normalizeRecord(record) {
  if (!record) return record
  return {
    ...record,
    id: toId(record.id || record._id),
  }
}

export function normalizeList(list) {
  return (list || []).map(normalizeRecord)
}

export function normalizeIssue(issue) {
  if (!issue) return issue
  return {
    ...normalizeRecord(issue),
    bookId: toId(issue.bookId || issue.book),
    memberId: toId(issue.memberId || issue.member),
  }
}

export function normalizeIssues(list) {
  return (list || []).map(normalizeIssue)
}
