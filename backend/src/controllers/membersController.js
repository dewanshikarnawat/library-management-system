import Member from '../models/Member.js'
import Issue from '../models/Issue.js'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorHandler.js'

async function nextMemberId() {
  const count = await Member.countDocuments()
  return `MEM${String(count + 1).padStart(3, '0')}`
}

async function getAccountInfo(member) {
  if (!member.userRef) {
    return { hasLoginAccount: false, accountRole: null, userId: null }
  }
  const user = await User.findById(member.userRef).select('role')
  if (!user) {
    return { hasLoginAccount: false, accountRole: null, userId: null }
  }
  return {
    hasLoginAccount: true,
    accountRole: user.role,
    userId: user._id,
  }
}

async function memberToJSON(member, booksIssued) {
  const issued =
    booksIssued ??
    (await Issue.countDocuments({
      member: member._id,
      status: { $in: ['issued', 'overdue'] },
    }))
  const account = await getAccountInfo(member)
  return member.toListJSON(issued, account)
}

async function withIssuedCounts(members) {
  const ids = members.map(m => m._id)
  const counts = await Issue.aggregate([
    { $match: { member: { $in: ids }, status: { $in: ['issued', 'overdue'] } } },
    { $group: { _id: '$member', count: { $sum: 1 } } },
  ])
  const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]))
  const userIds = members.filter(m => m.userRef).map(m => m.userRef)
  const users = await User.find({ _id: { $in: userIds } }).select('role')
  const roleMap = Object.fromEntries(users.map(u => [String(u._id), u.role]))

  return members.map(m => {
    const account = m.userRef
      ? {
          hasLoginAccount: !!roleMap[String(m.userRef)],
          accountRole: roleMap[String(m.userRef)] || null,
          userId: m.userRef,
        }
      : { hasLoginAccount: false, accountRole: null, userId: null }
    return m.toListJSON(countMap[String(m._id)] || 0, account)
  })
}

export const getMembers = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.q) {
    const regex = new RegExp(req.query.q.trim(), 'i')
    filter.$or = [{ name: regex }, { email: regex }, { memberId: regex }]
  }
  const members = await Member.find(filter).sort({ createdAt: -1 })
  res.json(await withIssuedCounts(members))
})

export const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id)
  if (!member) return res.status(404).json({ message: 'Member not found' })
  res.json(await memberToJSON(member))
})

export const createMember = asyncHandler(async (req, res) => {
  const memberId = req.body.memberId || (await nextMemberId())
  const member = await Member.create({
    ...req.body,
    memberId,
    avatar: req.body.name?.slice(0, 2).toUpperCase() || 'MB',
  })

  if (req.body.password) {
    const user = await User.create({
      name: member.name,
      email: member.email,
      password: req.body.password,
      role: 'member',
      avatar: member.avatar,
      memberRef: member._id,
    })
    member.userRef = user._id
    await member.save()
  }

  res.status(201).json(await memberToJSON(member, 0))
})

export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!member) return res.status(404).json({ message: 'Member not found' })
  res.json(await memberToJSON(member))
})

export const promoteMemberToAdmin = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id)
  if (!member) return res.status(404).json({ message: 'Member not found' })

  let user = member.userRef ? await User.findById(member.userRef) : null

  if (user?.role === 'admin') {
    return res.status(400).json({ message: 'This member already has administrator access' })
  }

  if (user) {
    user.role = 'admin'
    await user.save()
  } else {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password (minimum 6 characters) is required to create an administrator login for this member',
      })
    }

    const existingByEmail = await User.findOne({ email: member.email.toLowerCase() })
    if (existingByEmail) {
      if (existingByEmail.role === 'admin') {
        return res.status(400).json({ message: 'A user with this email is already an administrator' })
      }
      existingByEmail.role = 'admin'
      existingByEmail.name = member.name
      existingByEmail.avatar = member.avatar
      if (!existingByEmail.memberRef) existingByEmail.memberRef = member._id
      await existingByEmail.save()
      user = existingByEmail
    } else {
      user = await User.create({
        name: member.name,
        email: member.email,
        password,
        role: 'admin',
        avatar: member.avatar,
        memberRef: member._id,
      })
    }
    member.userRef = user._id
    await member.save()
  }

  res.json(await memberToJSON(member))
})

export const deleteMember = asyncHandler(async (req, res) => {
  const active = await Issue.countDocuments({
    member: req.params.id,
    status: { $in: ['issued', 'overdue'] },
  })
  if (active > 0) {
    return res.status(400).json({ message: 'Cannot delete member with active book issues' })
  }
  const member = await Member.findByIdAndDelete(req.params.id)
  if (!member) return res.status(404).json({ message: 'Member not found' })
  if (member.userRef) await User.findByIdAndDelete(member.userRef)
  res.json({ message: 'Member deleted' })
})

export const getMemberIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ member: req.params.id }).sort({ issueDate: -1 })
  res.json(issues.map(i => i.toListJSON()))
})
