import Book from '../models/Book.js'
import Member from '../models/Member.js'
import Issue from '../models/Issue.js'
import { ISSUE_DURATION_DAYS, MAX_BOOKS_PER_MEMBER } from '../config/constants.js'
import { addDays, computeFine, deriveIssueStatus, formatDateISO } from '../utils/dates.js'
import { asyncHandler } from '../middleware/errorHandler.js'

async function refreshOverdueStatuses() {
  const today = formatDateISO()
  await Issue.updateMany(
    { status: 'issued', dueDate: { $lt: today } },
    { $set: { status: 'overdue' } }
  )
}

export const getIssues = asyncHandler(async (req, res) => {
  await refreshOverdueStatuses()
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.memberId) filter.member = req.query.memberId
  if (req.query.bookId) filter.book = req.query.bookId
  const issues = await Issue.find(filter).sort({ issueDate: -1 })
  res.json(issues.map(i => i.toListJSON()))
})

export const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
  if (!issue) return res.status(404).json({ message: 'Issue not found' })
  res.json(issue.toListJSON())
})

export const issueBook = asyncHandler(async (req, res) => {
  const { bookId, memberId } = req.body
  if (!bookId || !memberId) {
    return res.status(400).json({ message: 'bookId and memberId are required' })
  }

  const book = await Book.findById(bookId)
  const member = await Member.findById(memberId)
  if (!book) return res.status(404).json({ message: 'Book not found' })
  if (!member) return res.status(404).json({ message: 'Member not found' })
  if (member.status !== 'active') {
    return res.status(400).json({ message: 'Member is not active' })
  }
  if (book.availableCopies < 1) {
    return res.status(400).json({ message: 'No copies available' })
  }

  const activeCount = await Issue.countDocuments({
    member: member._id,
    status: { $in: ['issued', 'overdue'] },
  })
  if (activeCount >= MAX_BOOKS_PER_MEMBER) {
    return res.status(400).json({ message: `Member can have at most ${MAX_BOOKS_PER_MEMBER} books` })
  }

  const issueDate = formatDateISO()
  let dueDate = req.body.dueDate
  if (dueDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return res.status(400).json({ message: 'dueDate must be YYYY-MM-DD' })
    }
    if (dueDate < issueDate) {
      return res.status(400).json({ message: 'Due date cannot be before the issue date' })
    }
  } else {
    dueDate = addDays(issueDate, ISSUE_DURATION_DAYS)
  }

  const issue = await Issue.create({
    book: book._id,
    member: member._id,
    bookTitle: book.title,
    memberName: member.name,
    memberId_str: member.memberId,
    issueDate,
    dueDate,
    status: 'issued',
    fine: 0,
  })

  book.availableCopies -= 1
  book.syncAvailability()
  await book.save()

  res.status(201).json(issue.toListJSON())
})

export const returnBook = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
  if (!issue) return res.status(404).json({ message: 'Issue not found' })
  if (issue.status === 'returned') {
    return res.status(400).json({ message: 'Book already returned' })
  }

  const returnDate = formatDateISO()
  const fine = computeFine(issue.dueDate, returnDate)
  issue.returnDate = returnDate
  issue.fine = fine
  issue.status = 'returned'
  await issue.save()

  const book = await Book.findById(issue.book)
  if (book) {
    book.availableCopies += 1
    book.syncAvailability()
    await book.save()
  }

  res.json(issue.toListJSON())
})

export const getOverdue = asyncHandler(async (_req, res) => {
  await refreshOverdueStatuses()
  const issues = await Issue.find({ status: 'overdue' }).sort({ dueDate: 1 })
  res.json(issues.map(i => i.toListJSON()))
})

export const getHistory = asyncHandler(async (_req, res) => {
  const issues = await Issue.find().sort({ issueDate: -1 })
  res.json(
    issues.map(i => ({
      ...i.toListJSON(),
      status: deriveIssueStatus(i.dueDate, i.returnDate, i.status),
    }))
  )
})
