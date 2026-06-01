import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import Badge from '../../components/ui/Badge'
const FALLBACK = 'https://via.placeholder.com/120x160/0ea5e9/white?text=Book'

export default function BookCard({ book, onDelete }) {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden group"
    >
      <div className="relative">
        <img
          src={book.cover}
          alt={book.title}
          onError={e => { e.target.src = FALLBACK }}
          className="w-full h-44 object-cover object-top bg-surface-100 dark:bg-surface-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
          <button onClick={() => navigate(`/books/${book.id}`)} className="bg-white/90 text-surface-800 p-2 rounded-lg hover:bg-white transition-colors">
            <FiEye size={15} />
          </button>
          <button onClick={() => navigate(`/books/edit/${book.id}`)} className="bg-white/90 text-surface-800 p-2 rounded-lg hover:bg-white transition-colors">
            <FiEdit2 size={15} />
          </button>
          <button onClick={() => onDelete(book)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors">
            <FiTrash2 size={15} />
          </button>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={book.availableCopies > 0 ? 'success' : 'danger'}>
            {book.availableCopies > 0 ? `${book.availableCopies} left` : 'Out'}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100 leading-tight mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{book.author}</p>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="info" className="text-xs">{book.category}</Badge>
          <span className="text-xs text-surface-400 font-mono">{book.isbn.slice(-6)}</span>
        </div>
      </div>
    </motion.div>
  )
}