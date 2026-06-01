import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { BOOK_CATEGORIES } from '../../utils/constants'
import booksService from '../../services/booksService'
import { useToast } from '../../context/ToastContext'

const INIT = { title: '', author: '', isbn: '', category: 'Technology', publisher: '', totalCopies: '', description: '', cover: '' }

function BookField({ label, name, type = 'text', required, form, errors, set, ...rest }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
      <input
        type={type}
        className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        {...rest}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )
}

export default function AddBookPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(INIT)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.author.trim()) e.author = 'Required'
    if (!form.isbn.trim()) e.isbn = 'Required'
    if (!form.publisher.trim()) e.publisher = 'Required'
    if (!form.totalCopies || form.totalCopies < 1) e.totalCopies = 'Min 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await booksService.create({
        ...form,
        totalCopies: Number(form.totalCopies),
      })
      toast(`"${form.title}" added successfully!`, 'success')
      navigate('/books')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add New Book" subtitle="Fill in the details to add a book to the collection">
        <Button variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Back</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <BookField label="Title" name="title" required placeholder="Book title" form={form} errors={errors} set={set} />
            <BookField label="Author" name="author" required placeholder="Author name" form={form} errors={errors} set={set} />
            <BookField label="ISBN" name="isbn" required placeholder="978-0-00-000000-0" form={form} errors={errors} set={set} />
            <div>
              <label className="label">Category <span className="text-red-400">*</span></label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {BOOK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <BookField label="Publisher" name="publisher" required placeholder="Publisher name" form={form} errors={errors} set={set} />
            <BookField label="Total Copies" name="totalCopies" type="number" required placeholder="e.g. 5" min="1" form={form} errors={errors} set={set} />
          </div>
          <BookField label="Book Cover URL" name="cover" placeholder="https://... (optional)" form={form} errors={errors} set={set} />
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Brief description of the book…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}><FiSave size={16} /> Save Book</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}