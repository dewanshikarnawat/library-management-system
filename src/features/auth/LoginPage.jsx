import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast('Welcome back!', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Login failed', 'error')
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
          <FiBookOpen size={26} className="text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">Admin sign in</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Manage books, members, and issues</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </div>
        )}

        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input
              type="email"
              className={`input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="admin@library.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="label mb-0">Password</label>
          <div className="relative mt-1.5">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
            <input
              type={showPass ? 'text' : 'password'}
              className={`input pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
            <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <Button type="submit" loading={loading} className="w-full justify-center">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-5">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign up</Link>
      </p>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-3">
        <Link to="/" className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">Back to home</Link>
      </p>
    </div>
  )
}
