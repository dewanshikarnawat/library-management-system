import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiGrid, FiList, FiFilter, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import BookCard from './BookCard'
import booksService from '../../services/booksService'
import { BOOK_CATEGORIES } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { normalizeList } from '../../utils/normalize'

const PAGE_SIZE = 8

export default function BooksPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('title')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    booksService.getAll()
      .then(({ data }) => { if (!cancelled) setBooks(normalizeList(data)) })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const filtered = useMemo(() => {
    let list = books
    if (search) list = list.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()) || b.isbn.includes(search))
    if (category !== 'All') list = list.filter(b => b.category === category)
    if (status !== 'All') list = list.filter(b => status === 'Available' ? b.availableCopies > 0 : b.availableCopies === 0)
    list = [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'author') return a.author.localeCompare(b.author)
      if (sort === 'copies') return b.availableCopies - a.availableCopies
      return 0
    })
    return list
  }, [books, search, category, status, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await booksService.delete(deleteTarget.id)
      setBooks(b => b.filter(x => x.id !== deleteTarget.id))
      toast(`"${deleteTarget.title}" deleted`, 'success')
      setDeleteTarget(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Books" subtitle={`${filtered.length} books in collection`}>
        <Button onClick={() => navigate('/books/add')}><FiPlus size={16} /> Add Book</Button>
      </PageHeader>

      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9 py-2 text-sm" placeholder="Search title, author, ISBN…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input py-2 text-sm w-auto" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
          <option>All</option>
          {BOOK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input py-2 text-sm w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option>All</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
        <select className="input py-2 text-sm w-auto" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="title">Sort: Title</option>
          <option value="author">Sort: Author</option>
          <option value="copies">Sort: Available</option>
        </select>
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600' : 'text-surface-400'}`}><FiGrid size={16} /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600' : 'text-surface-400'}`}><FiList size={16} /></button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={FiFilter} title="No books found" description="Try adjusting your search or filters" />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          {paginated.map((book, i) => (
            <motion.div key={book.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <BookCard book={book} onDelete={setDeleteTarget} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr>
                {['Title', 'Author', 'Category', 'ISBN', 'Copies', 'Status', 'Actions'].map(h => (
                  <th key={h} className="table-head">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(book => (
                <tr key={book.id} className="table-row">
                  <td className="table-cell font-semibold max-w-xs truncate">{book.title}</td>
                  <td className="table-cell">{book.author}</td>
                  <td className="table-cell"><Badge variant="info">{book.category}</Badge></td>
                  <td className="table-cell font-mono text-xs">{book.isbn}</td>
                  <td className="table-cell">{book.availableCopies}/{book.totalCopies}</td>
                  <td className="table-cell"><Badge variant={book.availableCopies > 0 ? 'success' : 'danger'}>{book.availableCopies > 0 ? 'Available' : 'Unavailable'}</Badge></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/books/${book.id}`)} className="btn-ghost p-1.5 text-xs"><FiSearch size={14} /></button>
                      <button onClick={() => navigate(`/books/edit/${book.id}`)} className="btn-ghost p-1.5 text-xs text-primary-600 dark:text-primary-400"><FiEdit2 size={14} /></button>
                      <button onClick={() => setDeleteTarget(book)} className="btn-ghost p-1.5 text-xs text-red-500"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-2 px-3 text-sm disabled:opacity-40">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'btn-secondary py-2 px-3'}`}>
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-2 px-3 text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
