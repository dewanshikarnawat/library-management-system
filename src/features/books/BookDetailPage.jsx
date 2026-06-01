import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiEdit2, FiBook, FiUser, FiHash, FiTag, FiCopy } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import booksService from '../../services/booksService'
import issuesService from '../../services/issuesService'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { normalizeRecord, normalizeIssues } from '../../utils/normalize'

const FALLBACK = 'https://via.placeholder.com/200x280/0ea5e9/white?text=Book'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [book, setBook] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      booksService.getById(id),
      issuesService.getAll({ bookId: id }),
    ])
      .then(([bookRes, issuesRes]) => {
        if (cancelled) return
        setBook(normalizeRecord(bookRes.data))
        setHistory(normalizeIssues(issuesRes.data))
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!book) return <div className="text-center py-20 text-surface-400">Book not found</div>

  const info = [
    { icon: FiUser, label: 'Author', value: book.author },
    { icon: FiHash, label: 'ISBN', value: book.isbn },
    { icon: FiTag, label: 'Category', value: book.category },
    { icon: FiBook, label: 'Publisher', value: book.publisher },
    { icon: FiCopy, label: 'Total Copies', value: book.totalCopies },
    { icon: FiCopy, label: 'Available', value: book.availableCopies },
  ]

  return (
    <div>
      <PageHeader title="Book Details">
        <Button variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Back</Button>
        <Button onClick={() => navigate(`/books/edit/${book.id}`)}><FiEdit2 size={16} /> Edit</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card p-6 flex flex-col items-center">
          <img src={book.cover} alt={book.title} onError={e => { e.target.src = FALLBACK }} className="w-40 h-56 object-cover rounded-xl shadow-lg mb-4" />
          <Badge variant={book.availableCopies > 0 ? 'success' : 'danger'} className="text-sm px-4 py-1 mb-2">
            {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
          </Badge>
          <div className="text-center mt-2">
            <p className="text-xs text-surface-400">Added on</p>
            <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{formatDate(book.addedDate)}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">{book.title}</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-4">{book.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-surface-50 dark:bg-surface-900 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} className="text-primary-500" />
                    <span className="text-xs text-surface-400 font-medium">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Issue History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-surface-400">No issue records for this book.</p>
            ) : (
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between py-2.5 border-b border-surface-100 dark:border-surface-700 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{h.memberName}</p>
                      <p className="text-xs text-surface-400">{formatDate(h.issueDate)} → {formatDate(h.dueDate)}</p>
                    </div>
                    <Badge variant={h.status === 'returned' ? 'success' : h.status === 'overdue' ? 'danger' : 'info'}>
                      {h.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
