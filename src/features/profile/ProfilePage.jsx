import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiSave, FiUser, FiMail, FiCalendar, FiShield } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(form)
      toast('Profile updated!', 'success')
      setEditing(false)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Admin Profile" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card p-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-glow">
            {user?.avatar}
          </div>
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">{user?.name}</h2>
          <p className="text-sm text-surface-400 mb-3">{user?.email}</p>
          <Badge variant="info" className="text-sm px-4 py-1">
            <FiShield size={12} /> Administrator
          </Badge>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200">Personal Information</h3>
              {!editing ? (
                <Button variant="secondary" onClick={() => setEditing(true)}><FiEdit2 size={15} /> Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} loading={loading}><FiSave size={15} /> Save</Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: FiUser, label: 'Full Name', name: 'name', value: form.name },
                { icon: FiMail, label: 'Email', name: 'email', value: form.email },
              ].map(({ icon: Icon, label, name, value }) => (
                <div key={name}>
                  <label className="label flex items-center gap-1.5"><Icon size={13} /> {label}</label>
                  {editing ? (
                    <input className="input" value={value} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} />
                  ) : (
                    <p className="px-4 py-2.5 bg-surface-50 dark:bg-surface-900 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300">{value}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="label flex items-center gap-1.5"><FiCalendar size={13} /> Joined</label>
                <p className="px-4 py-2.5 bg-surface-50 dark:bg-surface-900 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300">{formatDate(user?.joinDate)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
