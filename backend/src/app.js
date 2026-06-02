import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import booksRoutes from './routes/booksRoutes.js'
import membersRoutes from './routes/membersRoutes.js'
import issuesRoutes from './routes/issuesRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

const localDevOriginRe = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/

function parseClientUrls(value) {
  return (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function isAllowedOrigin(origin) {
  // Allow non-browser clients (no Origin header), e.g. curl/Postman.
  if (!origin) return true

  const explicit = parseClientUrls(process.env.CLIENT_URL)
  if (explicit.length > 0) {
    // Allow configured origins; also allow localhost/127.0.0.1 for development.
    return explicit.includes(origin) || localDevOriginRe.test(origin)
  }

  // Default dev behavior: allow localhost/127.0.0.1 on any port.
  return localDevOriginRe.test(origin)
}

app.use(cors({
  origin(origin, callback) {
    return callback(null, isAllowedOrigin(origin))
  },
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
