import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
    toast('Reset link sent to your email', 'success')
  }

  return (
    <div className="card p-8">
      {!sent ? (
        <>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiMail size={26} className="text-amber-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">Forgot password?</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Enter your email and we'll send a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full justify-center">Send Reset Link</Button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={30} className="text-emerald-500" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2 text-surface-900 dark:text-surface-50">Check your email</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">We sent a reset link to <strong>{email}</strong></p>
          <Button variant="secondary" onClick={() => setSent(false)} className="mx-auto">Try another email</Button>
        </div>
      )}
      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <FiArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  )
}