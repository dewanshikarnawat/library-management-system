import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    bookTitle: { type: String, required: true },
    memberName: { type: String, required: true },
    memberId_str: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnDate: { type: String, default: null },
    status: { type: String, enum: ['issued', 'overdue', 'returned'], default: 'issued' },
    fine: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

issueSchema.methods.toListJSON = function toListJSON() {
  return {
    id: this._id,
    bookId: this.book,
    bookTitle: this.bookTitle,
    memberId: this.member,
    memberName: this.memberName,
    memberId_str: this.memberId_str,
    issueDate: this.issueDate,
    dueDate: this.dueDate,
    returnDate: this.returnDate,
    status: this.status,
    fine: this.fine,
  }
}

export default mongoose.model('Issue', issueSchema)
