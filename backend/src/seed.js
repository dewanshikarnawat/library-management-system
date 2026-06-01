import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import Member from './models/Member.js'
import Book from './models/Book.js'
import Issue from './models/Issue.js'

dotenv.config()

const reset = process.argv.includes('--reset') || process.env.SEED_RESET === '1'

async function seed() {
  await connectDB()

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@library.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existing = await User.findOne({ email: adminEmail })
  if (existing?.role === 'admin' && !reset) {
    console.log('Admin user already exists:', adminEmail)
    console.log('Run npm run seed:reset to wipe demo data and recreate the admin account.')
    process.exit(0)
  }

  console.log('Clearing existing data...')
  await Promise.all([Issue.deleteMany(), Book.deleteMany(), Member.deleteMany(), User.deleteMany()])

  console.log('Creating admin user...')
  await User.create({
    name: 'Library Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    avatar: 'LA',
    joinDate: new Date().toISOString().slice(0, 10),
  })

  console.log('Seed complete. Sign in with:')
  console.log(`  Email:    ${adminEmail}`)
  console.log(`  Password: ${adminPassword}`)
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
