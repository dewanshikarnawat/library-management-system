import Book from '../models/Book.js'
import Member from '../models/Member.js'
import Issue from '../models/Issue.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { formatDateISO } from '../utils/dates.js'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CATEGORY_COLORS = {
  Technology: '#0ea5e9',
  Fiction: '#f97316',
  History: '#8b5cf6',
  'Self-Help': '#10b981',
  Finance: '#f59e0b',
  Psychology: '#64748b',
  Science: '#06b6d4',
  Biography: '#ec4899',
  Philosophy: '#84cc16',
  Mathematics: '#6366f1',
}

export const getStats = asyncHandler(async (_req, res) => {
  const today = formatDateISO()
  await Issue.updateMany(
    { status: 'issued', dueDate: { $lt: today } },
    { $set: { status: 'overdue' } }
  )

  const [totalBooks, availableAgg, issuedBooks, overdueBooks, totalMembers, activeMembers] =
    await Promise.all([
      Book.countDocuments(),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$availableCopies' } } }]),
      Issue.countDocuments({ status: 'issued' }),
      Issue.countDocuments({ status: 'overdue' }),
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
    ])

  res.json({
    totalBooks,
    availableBooks: availableAgg[0]?.total || 0,
    issuedBooks,
    overdueBooks,
    totalMembers,
    activeMembers,
  })
})

export const getMonthlyStats = asyncHandler(async (_req, res) => {
  const year = new Date().getFullYear()
  const start = `${year}-01-01`
  const end = `${year}-12-31`

  const issues = await Issue.find({
    issueDate: { $gte: start, $lte: end },
  })
  const returns = await Issue.find({
    returnDate: { $gte: start, $lte: end, $ne: null },
  })

  const monthly = MONTH_LABELS.map((month, index) => ({
    month,
    issued: 0,
    returned: 0,
  }))

  for (const row of issues) {
    const m = new Date(row.issueDate).getMonth()
    monthly[m].issued += 1
  }
  for (const row of returns) {
    if (!row.returnDate) continue
    const m = new Date(row.returnDate).getMonth()
    monthly[m].returned += 1
  }

  res.json(monthly)
})

export const getCategoryStats = asyncHandler(async (_req, res) => {
  const grouped = await Book.aggregate([
    { $group: { _id: '$category', value: { $sum: 1 } } },
    { $sort: { value: -1 } },
  ])

  res.json(
    grouped.map(g => ({
      name: g._id,
      value: g.value,
      color: CATEGORY_COLORS[g._id] || '#64748b',
    }))
  )
})

export const getActivity = asyncHandler(async (_req, res) => {
  const recentIssues = await Issue.find().sort({ updatedAt: -1 }).limit(8)
  const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(2)
  const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(2)

  const activity = []

  for (const issue of recentIssues) {
    if (issue.status === 'returned') {
      activity.push({
        id: `return-${issue._id}`,
        type: 'return',
        text: `${issue.memberName} returned "${issue.bookTitle}"`,
        time: issue.returnDate || issue.updatedAt,
        color: 'success',
      })
    } else if (issue.status === 'overdue') {
      activity.push({
        id: `overdue-${issue._id}`,
        type: 'overdue',
        text: `"${issue.bookTitle}" is overdue by ${issue.memberName}`,
        time: issue.dueDate,
        color: 'danger',
      })
    } else {
      activity.push({
        id: `issue-${issue._id}`,
        type: 'issue',
        text: `${issue.memberName} issued "${issue.bookTitle}"`,
        time: issue.issueDate,
        color: 'primary',
      })
    }
  }

  for (const member of recentMembers) {
    activity.push({
      id: `member-${member._id}`,
      type: 'member',
      text: `New member ${member.name} registered`,
      time: member.joinDate,
      color: 'accent',
    })
  }

  for (const book of recentBooks) {
    activity.push({
      id: `book-${book._id}`,
      type: 'book',
      text: `New book "${book.title}" added`,
      time: book.addedDate,
      color: 'info',
    })
  }

  activity.sort((a, b) => new Date(b.time) - new Date(a.time))
  res.json(activity.slice(0, 6))
})

export const getNotifications = asyncHandler(async (_req, res) => {
  const overdueCount = await Issue.countDocuments({ status: 'overdue' })
  const unavailable = await Book.find({ availableCopies: 0 }).limit(3)
  const latestMember = await Member.findOne().sort({ createdAt: -1 })

  const notifications = []
  if (overdueCount > 0) {
    notifications.push({
      id: 1,
      title: `${overdueCount} book(s) are overdue`,
      time: 'Just now',
    })
  }
  if (latestMember) {
    notifications.push({
      id: 2,
      title: `New member registration: ${latestMember.name}`,
      time: latestMember.joinDate,
    })
  }
  for (const [i, book] of unavailable.entries()) {
    notifications.push({
      id: 10 + i,
      title: `"${book.title}" has no available copies`,
      time: book.addedDate,
    })
  }

  res.json(notifications.slice(0, 5))
})
