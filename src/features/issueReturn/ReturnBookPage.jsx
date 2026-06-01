import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiCornerDownLeft, FiSearch, FiAlertCircle } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import issuesService from '../../services/issuesService'
import { useToast } from '../../context/ToastContext'
import { formatDate, daysUntilDue } from '../../utils/formatDate'
import { STATUS_COLORS } from '../../utils/constants'
import { normalizeIssues } from '../../utils/normalize'

export default function ReturnBookPage() {
  const { toast } = useToast()
  const [issues, setIssues] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    issuesService.getAll()
      .then(({ data }) => {
        if (!cancelled) setIssues(normalizeIssues(data).filter(i => i.status !== 'returned'))
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoadingData(false) })
    return () => { cancelled = true }
  }, [toast])

  const filtered = useMemo(() => issues.filter(i =>
    i.memberName.toLowerCase().includes(search.toLowerCase()) ||
    i.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
    i.memberId_str.includes(search)
  ), [issues, search])

  const handleReturn = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await issuesService.returnBook(selected.id)
      toast(`"${selected.bookTitle}" returned by ${selected.memberName} ✅`, 'success')
      setIssues(prev => prev.filter(i => i.id !== selected.id))
      setSelected(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const days = selected ? daysUntilDue(selected.dueDate) : null

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Return Book" subtitle="Process a book return" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-5">
            <div className="relative mb-4">
              <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input className="input pl-9 py-2 text-sm" placeholder="Search member name, book, or ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="space-y-2">
              {filtered.map(issue => {
                const d = daysUntilDue(issue.dueDate)
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => setSelected(issue)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left ${
                      selected?.id === issue.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:bg-surface-50 dark:hover:bg-surface-700/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-surface-800 dark:text-surface-200 truncate">{issue.bookTitle}</span>
                        <Badge variant={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
                      </div>
                      <p className="text-xs text-surface-500">{issue.memberName} · Due: {formatDate(issue.dueDate)}</p>
                    </div>
                    {d !== null && d < 0 && (
                      <div className="flex items-center gap-1 text-red-500 text-xs flex-shrink-0">
                        <FiAlertCircle size={13} /> {Math.abs(d)}d overdue
                      </div>
                    )}
                  </button>
                )
              })}
              {filtered.length === 0 && <p className="text-sm text-surface-400 text-center py-6">No active issues found</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sticky top-4">
              <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Return Summary</h3>
              <div className="space-y-3 mb-5">
                {[
                  { label: 'Book', value: selected.bookTitle },
                  { label: 'Member', value: selected.memberName },
                  { label: 'Member ID', value: selected.memberId_str },
                  { label: 'Issue Date', value: formatDate(selected.issueDate) },
                  { label: 'Due Date', value: formatDate(selected.dueDate) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-surface-400">{label}</span>
                    <span className="font-semibold text-surface-700 dark:text-surface-300 text-right max-w-[180px] truncate">{value}</span>
                  </div>
                ))}
                {days !== null && days < 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-100 dark:border-red-800/30">
                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
                      <FiAlertCircle size={15} /> Overdue by {Math.abs(days)} days
                    </p>
                    <p className="text-red-500 text-xs mt-0.5">Fine: ₹{selected.fine}</p>
                  </div>
                )}
              </div>
              <Button onClick={handleReturn} loading={loading} className="w-full justify-center">
                <FiCornerDownLeft size={16} /> Process Return
              </Button>
            </motion.div>
          ) : (
            <div className="card p-5 text-center text-surface-400">
              <FiCornerDownLeft size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Select an issue record to process return</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
