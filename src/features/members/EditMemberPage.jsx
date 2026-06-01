import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import membersService from '../../services/membersService'
import { useToast } from '../../context/ToastContext'
import { normalizeRecord } from '../../utils/normalize'

export default function EditMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let cancelled = false
    membersService.getById(id)
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

  if (!form) return <div className="text-center py-20 text-surface-400">Member not found</div>

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await membersService.update(id, form)
      toast(`${form.name} updated!`, 'success')
      navigate('/members')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <PageHeader title="Edit Member" subtitle={`Editing: ${form.name}`}>
        <Button variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Back</Button>
      </PageHeader>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Full Name', name: 'name', placeholder: 'John Doe' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'john@example.com' },
              { label: 'Phone', name: 'phone', placeholder: '+91-9876543210' },
            ].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input type={f.type || 'text'} className="input" placeholder={f.placeholder} value={form[f.name] || ''} onChange={e => set(f.name, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                {['active', 'inactive', 'suspended'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={2} value={form.address || ''} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}><FiSave size={16} /> Update Member</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
