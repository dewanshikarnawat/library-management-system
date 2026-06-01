import React, { useState, useMemo, useEffect } from 'react'
import { FiSearch, FiClock } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import issuesService from '../../services/issuesService'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { STATUS_COLORS } from '../../utils/constants'
import { motion } from 'framer-motion'
import { normalizeIssues } from '../../utils/normalize'

export default function IssueHistoryPage() {
  const { toast } = useToast()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    let cancelled = false
    issuesService.getHistory()
      .then(({ data }) => { if (!cancelled) setIssues(normalizeIssues(data)) })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const filtered = useMemo(() => {
    let list = issues
    if (search) list = list.filter(i => i.memberName.toLowerCase().includes(search.toLowerCase()) || i.bookTitle.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All') list = list.filter(i => i.status === statusFilter.toLowerCase())
    return list
  }, [issues, search, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Issue History" subtitle="Complete record of all book issues and returns" />

      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9 py-2 text-sm" placeholder="Search member or book…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input py-2 text-sm w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {['All', 'Issued', 'Returned', 'Overdue'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FiClock} title="No records found" description="Try adjusting your filters" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                {['Book', 'Member', 'Issue Date', 'Due Date', 'Return Date', 'Fine', 'Status'].map(h => (
                  <th key={h} className="table-head">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue, i) => (
                <motion.tr
                  key={issue.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="table-row"
                >
                  <td className="table-cell font-semibold max-w-xs truncate">{issue.bookTitle}</td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{issue.memberName}</p>
                      <p className="text-xs text-surface-400 font-mono">{issue.memberId_str}</p>
                    </div>
                  </td>
                  <td className="table-cell">{formatDate(issue.issueDate)}</td>
                  <td className="table-cell">{formatDate(issue.dueDate)}</td>
                  <td className="table-cell">{issue.returnDate ? formatDate(issue.returnDate) : <span className="text-surface-300 dark:text-surface-600">—</span>}</td>
                  <td className="table-cell">{issue.fine > 0 ? <span className="text-red-500 font-semibold">₹{issue.fine}</span> : <span className="text-emerald-500">—</span>}</td>
                  <td className="table-cell">
                    <Badge variant={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
