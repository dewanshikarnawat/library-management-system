import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiRepeat, FiSearch } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import booksService from '../../services/booksService'
import membersService from '../../services/membersService'
import issuesService from '../../services/issuesService'
import { useToast } from '../../context/ToastContext'
import { formatDate, toDateISO, addDaysISO, daysBetweenISO } from '../../utils/formatDate'
import { ISSUE_DURATION_DAYS } from '../../utils/constants'

const LOAN_PRESETS = [7, 14, 21, 30]
import { normalizeList } from '../../utils/normalize'

export default function IssueBookPage() {
  const { toast } = useToast()
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [memberSearch, setMemberSearch] = useState('')
  const [bookSearch, setBookSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loanDays, setLoanDays] = useState(ISSUE_DURATION_DAYS)
  const [dueDate, setDueDate] = useState(() => addDaysISO(toDateISO(), ISSUE_DURATION_DAYS))

  const issueDate = toDateISO()

  const setLoanPeriod = (days) => {
    const d = Math.min(365, Math.max(1, Number(days) || ISSUE_DURATION_DAYS))
    setLoanDays(d)
    setDueDate(addDaysISO(issueDate, d))
  }

  const handleDueDateChange = (value) => {
    setDueDate(value)
    if (value >= issueDate) setLoanDays(daysBetweenISO(issueDate, value))
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([membersService.getAll(), booksService.getAll()])
      .then(([membersRes, booksRes]) => {
        if (cancelled) return
        setMembers(normalizeList(membersRes.data))
        setBooks(normalizeList(booksRes.data))
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoadingData(false) })
    return () => { cancelled = true }
  }, [toast])

  const filteredMembers = useMemo(() => members.filter(m =>
    m.status === 'active' && (m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.memberId.includes(memberSearch))
  ).slice(0, 5), [members, memberSearch])

  const filteredBooks = useMemo(() => books.filter(b =>
    b.availableCopies > 0 && (b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.isbn.includes(bookSearch))
  ).slice(0, 5), [books, bookSearch])

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook) { toast('Select both member and book', 'warning'); return }
    if (dueDate < issueDate) { toast('Due date cannot be before today', 'error'); return }
    setLoading(true)
    try {
      await issuesService.issueBook(selectedBook.id, selectedMember.id, { dueDate })
      toast(`"${selectedBook.title}" issued to ${selectedMember.name} ✅`, 'success')
      setSelectedMember(null)
      setSelectedBook(null)
      setMemberSearch('')
      setBookSearch('')
      const { data } = await booksService.getAll()
      setBooks(normalizeList(data))
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Issue Book" subtitle="Assign a book to a library member" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
          <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Select Member</h3>
          <div className="relative mb-3">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input className="input pl-9 py-2 text-sm" placeholder="Search member name or ID…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filteredMembers.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setSelectedMember(m); setMemberSearch(m.name) }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedMember?.id === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:bg-surface-50 dark:hover:bg-surface-700/50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{m.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{m.name}</p>
                  <p className="text-xs text-surface-400 font-mono">{m.memberId} · {m.booksIssued} issued</p>
                </div>
              </button>
            ))}
            {memberSearch && filteredMembers.length === 0 && <p className="text-sm text-surface-400 text-center py-4">No active members found</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
          <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Select Book</h3>
          <div className="relative mb-3">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input className="input pl-9 py-2 text-sm" placeholder="Search book title or ISBN…" value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filteredBooks.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => { setSelectedBook(b); setBookSearch(b.title) }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedBook?.id === b.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:bg-surface-50 dark:hover:bg-surface-700/50'
                }`}
              >
                <img src={b.cover} onError={e => { e.target.src = 'https://via.placeholder.com/40x50/0ea5e9/white?text=B' }} className="w-10 h-12 object-cover rounded-lg flex-shrink-0 bg-surface-100" alt={b.title} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 truncate">{b.title}</p>
                  <p className="text-xs text-surface-400">{b.author}</p>
                  <Badge variant="success" className="mt-1">{b.availableCopies} available</Badge>
                </div>
              </button>
            ))}
            {bookSearch && filteredBooks.length === 0 && <p className="text-sm text-surface-400 text-center py-4">No available books found</p>}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6">
        <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Loan period</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Issue date</label>
            <p className="input bg-surface-50 dark:bg-surface-900 text-sm font-medium">{formatDate(issueDate)}</p>
          </div>
          <div>
            <label className="label" htmlFor="loan-days">Loan period (days)</label>
            <input
              id="loan-days"
              type="number"
              min={1}
              max={365}
              className="input text-sm"
              value={loanDays}
              onChange={e => setLoanPeriod(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="due-date">Due date</label>
            <input
              id="due-date"
              type="date"
              className="input text-sm"
              min={issueDate}
              value={dueDate}
              onChange={e => handleDueDateChange(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Quick select</label>
            <div className="flex flex-wrap gap-2">
              {LOAN_PRESETS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLoanPeriod(d)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    loanDays === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {(selectedMember || selectedBook) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
          <h3 className="font-display font-semibold text-primary-700 dark:text-primary-400 mb-3">Issue Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-surface-400 mb-1">Member</p>
              <p className="font-semibold text-surface-800 dark:text-surface-200">{selectedMember?.name || <span className="text-surface-400 italic">Not selected</span>}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400 mb-1">Book</p>
              <p className="font-semibold text-surface-800 dark:text-surface-200">{selectedBook?.title || <span className="text-surface-400 italic">Not selected</span>}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400 mb-1">Issue date</p>
              <p className="font-semibold text-surface-800 dark:text-surface-200">{formatDate(issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400 mb-1">Due date ({loanDays} days)</p>
              <p className="font-semibold text-surface-800 dark:text-surface-200">{formatDate(dueDate)}</p>
            </div>
          </div>
        </motion.div>
      )}

      <Button onClick={handleIssue} loading={loading} disabled={!selectedMember || !selectedBook}>
        <FiRepeat size={16} /> Issue Book
      </Button>
    </div>
  )
}
