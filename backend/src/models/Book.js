import mongoose from 'mongoose'
import { BOOK_CATEGORIES } from '../config/constants.js'

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, enum: BOOK_CATEGORIES, default: 'Technology' },
    publisher: { type: String, default: '' },
    totalCopies: { type: Number, required: true, min: 1, default: 1 },
    availableCopies: { type: Number, required: true, min: 0, default: 1 },
    cover: { type: String, default: '' },
    description: { type: String, default: '' },
    addedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
)

bookSchema.virtual('status').get(function status() {
  return this.availableCopies > 0 ? 'available' : 'unavailable'
})

bookSchema.set('toJSON', { virtuals: true })
bookSchema.set('toObject', { virtuals: true })

bookSchema.methods.syncAvailability = function syncAvailability() {
  if (this.availableCopies < 0) this.availableCopies = 0
  if (this.availableCopies > this.totalCopies) this.availableCopies = this.totalCopies
}

bookSchema.methods.toListJSON = function toListJSON() {
  return {
    id: this._id,
    title: this.title,
    author: this.author,
    isbn: this.isbn,
    category: this.category,
    publisher: this.publisher,
    totalCopies: this.totalCopies,
    availableCopies: this.availableCopies,
    status: this.status,
    cover: this.cover,
    description: this.description,
    addedDate: this.addedDate,
  }
}

export default mongoose.model('Book', bookSchema)
