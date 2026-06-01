import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/ui/Badge'
import issuesService from '../../services/issuesService'
import dashboardService from '../../services/dashboardService'
import { formatDate } from '../../utils/formatDate'
import { STATUS_COLORS } from '../../utils/constants'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { normalizeIssues } from '../../utils/normalize'

const TABS = ['Issued Books', 'Returned Books', 'Overdue Books']

export default function ReportsPage() {
  const [tab, setTab] = useState(0)
  const [issues, setIssues] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()
  const { toast } = useToast()
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  useEffect(() => {
    let cancelled = false
    Promise.all([issuesService.getHistory(), dashboardService.getMonthly()])
      .then(([issuesRes, monthlyRes]) => {
        if (cancelled) return
        setIssues(normalizeIssues(issuesRes.data))
        setMonthly(monthlyRes.data)
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const lists = useMemo(() => ({
    0: issues.filter(i => i.status === 'issued'),
    1: issues.filter(i => i.status === 'returned'),
    2: issues.filter(i => i.status === 'overdue'),
  }), [issues])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Statistics from your library database" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Issued', value: lists[0].length, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Total Returned', value: lists[1].length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Overdue', value: lists[2].length, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`card p-5 ${s.bg}`}>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">{s.label}</p>
            <p className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5 mb-6">
        <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Monthly Comparison</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} />
            <YAxis tick={{ fontSize: 11, fill: textColor }} />
            <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="issued" name="Issued" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="returned" name="Returned" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card overflow-hidden">
        <div className="flex items-center gap-0 border-b border-surface-100 dark:border-surface-700 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(i)}
              className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                tab === i ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
              }`}
            >
              {t} <span className="ml-1.5 bg-surface-100 dark:bg-surface-700 rounded-full px-2 py-0.5 text-xs">{lists[i].length}</span>
            </button>
          ))}
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Book', 'Member', 'Issue Date', 'Due Date', 'Fine', 'Status'].map(h => <th key={h} className="table-head">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lists[tab].map(issue => (
              <tr key={issue.id} className="table-row">
                <td className="table-cell font-semibold">{issue.bookTitle}</td>
                <td className="table-cell">{issue.memberName}</td>
                <td className="table-cell">{formatDate(issue.issueDate)}</td>
                <td className="table-cell">{formatDate(issue.dueDate)}</td>
                <td className="table-cell">{issue.fine > 0 ? <span className="text-red-500 font-semibold">₹{issue.fine}</span> : '—'}</td>
                <td className="table-cell"><Badge variant={STATUS_COLORS[issue.status]}>{issue.status}</Badge></td>
              </tr>
            ))}
            {lists[tab].length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-surface-400 text-sm">No records found</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
