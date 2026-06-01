import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMoon, FiShield } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import authService from '../../services/authService'

const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'}`}
  >
    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
)

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme()
  const { toast } = useToast()
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast('New passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast('Password must be at least 6 characters', 'error')
      return
    }
    setChangingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast('Password updated', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Appearance and security" />
      <div className="max-w-2xl space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiMoon size={16} className="text-primary-500" />
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200">Appearance</h3>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">Dark Mode</p>
              <p className="text-xs text-surface-400 mt-0.5">Switch between light and dark theme</p>
            </div>
            <Toggle value={isDark} onChange={toggleTheme} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiShield size={16} className="text-primary-500" />
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200">Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <input
                type="password"
                className="input"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                className="input"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                type="password"
                className="input"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" loading={changingPassword}>Update Password</Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
