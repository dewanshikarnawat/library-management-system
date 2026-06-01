import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import membersService from '../../services/membersService'
import { useToast } from '../../context/ToastContext'

const INIT = { name: '', email: '', phone: '', address: '', password: '' }

function MemberField({ label, name, type = 'text', required, placeholder, form, errors, setForm }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
      <input type={type} className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder={placeholder} value={form[name]} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )
}

export default function AddMemberPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(INIT)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/\S+@\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await membersService.create(form)
      toast(`Member "${form.name}" added!`, 'success')
      navigate('/members')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add New Member">
        <Button variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Back</Button>
      </PageHeader>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <MemberField label="Full Name" name="name" required placeholder="John Doe" form={form} errors={errors} setForm={setForm} />
            <MemberField label="Email" name="email" type="email" required placeholder="john@example.com" form={form} errors={errors} setForm={setForm} />
            <MemberField label="Phone" name="phone" required placeholder="+91-9876543210" form={form} errors={errors} setForm={setForm} />
            <MemberField label="Password" name="password" type="password" placeholder="Temporary password" form={form} errors={errors} setForm={setForm} />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={2} placeholder="Full address…" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}><FiSave size={16} /> Add Member</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}