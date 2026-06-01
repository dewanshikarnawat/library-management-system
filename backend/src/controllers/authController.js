import User from '../models/User.js'
import Member from '../models/Member.js'
import { signToken } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name?.trim() || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(400).json({ message: 'Email already registered' })

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: 'admin',
    avatar: name.trim().slice(0, 2).toUpperCase(),
  })

  const token = signToken(user._id)
  res.status(201).json({
    token,
    user: user.toPublicJSON(),
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can sign in' })
  }

  const token = signToken(user._id)
  res.json({
    token,
    user: user.toPublicJSON(),
  })
})

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body
  if (name) req.user.name = name
  if (email) req.user.email = email.toLowerCase()
  if (name) req.user.avatar = name.slice(0, 2).toUpperCase()
  await req.user.save()

  if (req.user.memberRef) {
    await Member.findByIdAndUpdate(req.user.memberRef, {
      ...(name && { name, avatar: req.user.avatar }),
      ...(email && { email: email.toLowerCase() }),
    })
  }

  res.json({ user: req.user.toPublicJSON() })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' })
  }
  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' })
  }
  user.password = newPassword
  await user.save()
  res.json({ message: 'Password updated' })
})

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out' })
})
