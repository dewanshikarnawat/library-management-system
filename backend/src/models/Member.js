import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    memberId: { type: String, required: true, unique: true, uppercase: true },
    role: { type: String, default: 'member' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

memberSchema.virtual('booksIssued', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'member',
  count: true,
  match: { status: { $in: ['issued', 'overdue'] } },
})

memberSchema.set('toJSON', { virtuals: true })
memberSchema.set('toObject', { virtuals: true })

memberSchema.methods.toListJSON = function toListJSON(booksIssued = 0, account = {}) {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    memberId: this.memberId,
    role: this.role,
    status: this.status,
    joinDate: this.joinDate,
    booksIssued,
    avatar: this.avatar || this.name.slice(0, 2).toUpperCase(),
    address: this.address,
    hasLoginAccount: account.hasLoginAccount ?? false,
    accountRole: account.accountRole ?? null,
    userId: account.userId ?? null,
  }
}

export default mongoose.model('Member', memberSchema)
