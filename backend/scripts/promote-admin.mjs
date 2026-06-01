/**
 * Promote a user to admin by email.
 * Usage: node scripts/promote-admin.mjs you@example.com
 */
import dotenv from 'dotenv'
import { connectDB } from '../src/config/db.js'
import User from '../src/models/User.js'

dotenv.config()

const email = process.argv[2]?.toLowerCase()
if (!email) {
  console.error('Usage: node scripts/promote-admin.mjs <email>')
  process.exit(1)
}

await connectDB()
const user = await User.findOne({ email })
if (!user) {
  console.error(`No user found with email: ${email}`)
  process.exit(1)
}

user.role = 'admin'
await user.save()
console.log(`Promoted to admin: ${user.name} <${user.email}>`)
process.exit(0)
