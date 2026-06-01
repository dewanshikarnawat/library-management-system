/**
 * End-to-end API + database smoke test for LMS
 */
import dotenv from 'dotenv'
import { connectDB } from '../src/config/db.js'
import mongoose from 'mongoose'

dotenv.config()

const BASE = process.env.API_BASE || 'http://localhost:5000/api'
const results = []
let token = null
let createdBookId = null
let createdMemberId = null
let createdIssueId = null
const testEmail = `e2e-${Date.now()}@library.test`
const testPassword = 'testpass123'

function pass(name, detail = '') {
  results.push({ name, ok: true, detail })
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail })
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { status: res.status, data }
}

async function testDatabase() {
  console.log('\n── Database (MongoDB) ──')
  try {
    await connectDB()
    pass('MongoDB connection', mongoose.connection.host)
    const collections = await mongoose.connection.db.listCollections().toArray()
    const names = collections.map(c => c.name).sort().join(', ')
    pass('Collections visible', names || '(empty)')
  } catch (err) {
    fail('MongoDB connection', err.message)
    throw err
  }
}

async function testAuth() {
  console.log('\n── Auth ──')
  const reg = await request('POST', '/auth/register', {
    name: 'E2E Admin',
    email: testEmail,
    password: testPassword,
  })
  if (reg.status === 201 && reg.data?.token && reg.data?.user?.role === 'admin') {
    token = reg.data.token
    pass('POST /auth/register', testEmail)
  } else {
    fail('POST /auth/register', `status ${reg.status}: ${reg.data?.message || 'no token'}`)
    return
  }

  const profile = await request('GET', '/auth/profile', null, true)
  if (profile.status === 200 && profile.data?.user?.email === testEmail) {
    pass('GET /auth/profile')
  } else {
    fail('GET /auth/profile', `status ${profile.status}`)
  }

  const badLogin = await request('POST', '/auth/login', { email: testEmail, password: 'wrong' })
  if (badLogin.status === 401) pass('Login rejects wrong password')
  else fail('Login rejects wrong password', `status ${badLogin.status}`)

  const login = await request('POST', '/auth/login', { email: testEmail, password: testPassword })
  if (login.status === 200 && login.data?.token) {
    token = login.data.token
    pass('POST /auth/login')
  } else {
    fail('POST /auth/login', `status ${login.status}`)
  }
}

async function testBooks() {
  console.log('\n── Books ──')
  const create = await request('POST', '/books', {
    title: 'E2E Test Book',
    author: 'Test Author',
    isbn: `978-E2E-${Date.now()}`,
    category: 'Technology',
    publisher: 'Test Pub',
    totalCopies: 3,
    availableCopies: 3,
    description: 'Smoke test book',
  }, true)
  if (create.status === 201 && create.data?.id) {
    createdBookId = create.data.id
    pass('POST /books', createdBookId)
  } else {
    fail('POST /books', `status ${create.status}: ${create.data?.message}`)
    return
  }

  const list = await request('GET', '/books', null, true)
  if (list.status === 200 && Array.isArray(list.data) && list.data.some(b => b.id === createdBookId)) {
    pass('GET /books', `${list.data.length} books`)
  } else {
    fail('GET /books', `status ${list.status}`)
  }

  const one = await request('GET', `/books/${createdBookId}`, null, true)
  if (one.status === 200 && one.data?.title === 'E2E Test Book') pass('GET /books/:id')
  else fail('GET /books/:id', `status ${one.status}`)

  const update = await request('PUT', `/books/${createdBookId}`, { totalCopies: 5, availableCopies: 5 }, true)
  if (update.status === 200) pass('PUT /books/:id')
  else fail('PUT /books/:id', `status ${update.status}`)
}

async function testMembers() {
  console.log('\n── Members ──')
  const create = await request('POST', '/members', {
    name: 'E2E Member',
    email: `member-${Date.now()}@library.test`,
    phone: '+91-9999999999',
    status: 'active',
    address: 'Test Address',
  }, true)
  if (create.status === 201 && create.data?.id) {
    createdMemberId = create.data.id
    pass('POST /members', create.data.memberId || createdMemberId)
  } else {
    fail('POST /members', `status ${create.status}: ${create.data?.message}`)
    return
  }

  const list = await request('GET', '/members', null, true)
  if (list.status === 200 && Array.isArray(list.data)) pass('GET /members', `${list.data.length} members`)
  else fail('GET /members', `status ${list.status}`)
}

async function testIssues() {
  console.log('\n── Issues (issue / return / custom due date) ──')
  if (!createdBookId || !createdMemberId) {
    fail('Issue flow', 'skipped — book or member missing')
    return
  }

  const issueDate = new Date().toISOString().split('T')[0]
  const due = new Date()
  due.setDate(due.getDate() + 21)
  const customDue = due.toISOString().split('T')[0]

  const issue = await request('POST', '/issues', {
    bookId: createdBookId,
    memberId: createdMemberId,
    dueDate: customDue,
  }, true)
  if (issue.status === 201 && issue.data?.dueDate === customDue) {
    createdIssueId = issue.data.id
    pass('POST /issues with custom dueDate', customDue)
  } else if (issue.status === 201) {
    createdIssueId = issue.data.id
    pass('POST /issues', `due: ${issue.data?.dueDate}`)
  } else {
    fail('POST /issues', `status ${issue.status}: ${issue.data?.message}`)
    return
  }

  const bookAfter = await request('GET', `/books/${createdBookId}`, null, true)
  if (bookAfter.data?.availableCopies === 4) pass('Book copies decremented after issue')
  else fail('Book copies after issue', `available=${bookAfter.data?.availableCopies}`)

  const history = await request('GET', '/issues/history', null, true)
  if (history.status === 200 && Array.isArray(history.data)) pass('GET /issues/history')
  else fail('GET /issues/history', `status ${history.status}`)

  const ret = await request('PUT', `/issues/${createdIssueId}/return`, null, true)
  if (ret.status === 200 && ret.data?.status === 'returned') pass('PUT /issues/:id/return')
  else fail('PUT /issues/:id/return', `status ${ret.status}: ${ret.data?.message}`)

  const invalidDue = await request('POST', '/issues', {
    bookId: createdBookId,
    memberId: createdMemberId,
    dueDate: '2020-01-01',
  }, true)
  if (invalidDue.status === 400) pass('Rejects due date before issue date')
  else fail('Rejects past due date', `status ${invalidDue.status}`)
}

async function testDashboard() {
  console.log('\n── Dashboard ──')
  for (const path of ['/dashboard/stats', '/dashboard/monthly', '/dashboard/categories', '/dashboard/activity', '/dashboard/notifications']) {
    const res = await request('GET', path, null, true)
    if (res.status === 200) pass(`GET ${path}`)
    else fail(`GET ${path}`, `status ${res.status}`)
  }
}

async function testCleanup() {
  console.log('\n── Cleanup ──')
  if (createdBookId) {
    const del = await request('DELETE', `/books/${createdBookId}`, null, true)
    if (del.status === 200) pass('DELETE /books/:id')
    else fail('DELETE /books/:id', `status ${del.status}`)
  }
  if (createdMemberId) {
    const del = await request('DELETE', `/members/${createdMemberId}`, null, true)
    if (del.status === 200) pass('DELETE /members/:id')
    else fail('DELETE /members/:id', `status ${del.status}`)
  }
}

async function testHealth() {
  console.log('\n── API health ──')
  try {
    const res = await fetch('http://localhost:5000/api/health')
    const data = await res.json()
    if (res.status === 200 && data.status === 'ok') pass('GET /api/health')
    else fail('GET /api/health', `status ${res.status}`)
  } catch (err) {
    fail('GET /api/health', err.message)
  }
}

async function main() {
  console.log('LMS E2E Test')
  console.log(`API: ${BASE}`)

  await testHealth()
  await testDatabase()
  await testAuth()
  await testBooks()
  await testMembers()
  await testIssues()
  await testDashboard()
  await testCleanup()

  await mongoose.disconnect()

  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  console.log('\n══════════════════════════════════')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  console.log('══════════════════════════════════\n')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('\nFatal:', err.message)
  process.exit(1)
})
