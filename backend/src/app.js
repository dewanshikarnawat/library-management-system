import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import booksRoutes from './routes/booksRoutes.js'
import membersRoutes from './routes/membersRoutes.js'
import issuesRoutes from './routes/issuesRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LMS API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/books', booksRoutes)
app.use('/api/members', membersRoutes)
app.use('/api/issues', issuesRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
