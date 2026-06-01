import Book from '../models/Book.js'
import Issue from '../models/Issue.js'
import { asyncHandler } from '../middleware/errorHandler.js'

function buildBookQuery({ q, category, status }) {
  const filter = {}
  if (category) filter.category = category
  if (status === 'available') filter.availableCopies = { $gt: 0 }
  if (status === 'unavailable') filter.availableCopies = 0
  if (q) {
    const regex = new RegExp(q.trim(), 'i')
    filter.$or = [
      { title: regex },
      { author: regex },
      { isbn: regex },
      { category: regex },
    ]
  }
  return filter
}

export const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find(buildBookQuery(req.query)).sort({ createdAt: -1 })
  res.json(books.map(b => b.toListJSON()))
})

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })
  res.json(book.toListJSON())
})

export const createBook = asyncHandler(async (req, res) => {
  const total = Number(req.body.totalCopies) || 1
  const book = await Book.create({
    ...req.body,
    totalCopies: total,
    availableCopies: total,
    addedDate: req.body.addedDate || new Date().toISOString().split('T')[0],
  })
  res.status(201).json(book.toListJSON())
})

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })

  const prevTotal = book.totalCopies
  Object.assign(book, req.body)

  if (req.body.totalCopies != null) {
    const diff = Number(req.body.totalCopies) - prevTotal
    book.availableCopies = Math.max(0, book.availableCopies + diff)
  }
  book.syncAvailability()
  await book.save()
  res.json(book.toListJSON())
})

export const deleteBook = asyncHandler(async (req, res) => {
  const activeIssues = await Issue.countDocuments({
    book: req.params.id,
    status: { $in: ['issued', 'overdue'] },
  })
  if (activeIssues > 0) {
    return res.status(400).json({ message: 'Cannot delete a book with active issues' })
  }
  const book = await Book.findByIdAndDelete(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found' })
  res.json({ message: 'Book deleted' })
})

export const searchBooks = asyncHandler(async (req, res) => {
  const books = await Book.find(buildBookQuery({ q: req.query.q })).limit(20)
  res.json(books.map(b => b.toListJSON()))
})

export const getByCategory = asyncHandler(async (req, res) => {
  const books = await Book.find({ category: req.query.category })
  res.json(books.map(b => b.toListJSON()))
})

export const getPopular = asyncHandler(async (_req, res) => {
  const popular = await Issue.aggregate([
    { $group: { _id: '$book', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ])
  const ids = popular.map(p => p._id)
  const books = await Book.find({ _id: { $in: ids } })
  res.json(books.map(b => b.toListJSON()))
})

export const getRecent = asyncHandler(async (_req, res) => {
  const books = await Book.find().sort({ createdAt: -1 }).limit(6)
  res.json(books.map(b => b.toListJSON()))
})
