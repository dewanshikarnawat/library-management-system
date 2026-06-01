import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { BOOK_CATEGORIES } from '../../utils/constants'
import booksService from '../../services/booksService'
import { useToast } from '../../context/ToastContext'
import { normalizeRecord } from '../../utils/normalize'

function BookField({ label, name, type = 'text', form, errors, set, ...rest }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`} value={form[name] || ''} onChange={e => set(name, e.target.value)} {...rest} />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )
}

export default function EditBookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let cancelled = false
    booksService.getById(id)
      .then(({ data }) => { if (!cancelled) setForm(normalizeRecord(data)) })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setFetching(false) })
    return () => { cancelled = true }
  }, [id, toast])

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!form) return <div className="text-center py-20 text-surface-400">Book not found</div>

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.title?.trim()) e.title = 'Required'
    if (!form.author?.trim()) e.author = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await booksService.update(id, {
        ...form,
        totalCopies: Number(form.totalCopies),
        availableCopies: Number(form.availableCopies),
      })
      toast(`"${form.title}" updated!`, 'success')
      navigate('/books')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Edit Book" subtitle={`Editing: ${form.title}`}>
        <Button variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Back</Button>
      </PageHeader>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <BookField label="Title" name="title" placeholder="Book title" form={form} errors={errors} set={set} />
            <BookField label="Author" name="author" placeholder="Author name" form={form} errors={errors} set={set} />
            <BookField label="ISBN" name="isbn" placeholder="978-0-00-000000-0" form={form} errors={errors} set={set} />
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category || ''} onChange={e => set('category', e.target.value)}>
                {BOOK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <BookField label="Publisher" name="publisher" form={form} errors={errors} set={set} />
            <BookField label="Total Copies" name="totalCopies" type="number" min="1" form={form} errors={errors} set={set} />
            <BookField label="Available Copies" name="availableCopies" type="number" min="0" form={form} errors={errors} set={set} />
          </div>
          <BookField label="Cover URL" name="cover" form={form} errors={errors} set={set} />
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}><FiSave size={16} /> Update Book</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
