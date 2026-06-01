import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen, FiShield } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'

function RegisterField({ name, label, type = 'text', icon: Icon, placeholder, extra, form, errors, setForm, showPass, setShowPass }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
        <input
          type={type}
          className={`input pl-10 ${extra || ''} ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        />
        {name === 'password' && (
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      toast('Admin account created!', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Registration failed', 'error')
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-accent">
          <FiBookOpen size={26} className="text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">Create admin account</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center justify-center gap-1.5">
          <FiShield size={14} /> Sign up to manage your library
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </div>
        )}

        <RegisterField name="name" label="Full Name" icon={FiUser} placeholder="Your name" form={form} errors={errors} setForm={setForm} showPass={showPass} setShowPass={setShowPass} />
        <RegisterField name="email" label="Email address" icon={FiMail} placeholder="you@example.com" form={form} errors={errors} setForm={setForm} showPass={showPass} setShowPass={setShowPass} />
        <RegisterField name="password" label="Password" type={showPass ? 'text' : 'password'} icon={FiLock} placeholder="Min. 6 characters" extra="pr-10" form={form} errors={errors} setForm={setForm} showPass={showPass} setShowPass={setShowPass} />
        <RegisterField name="confirm" label="Confirm Password" type="password" icon={FiLock} placeholder="Repeat your password" form={form} errors={errors} setForm={setForm} showPass={showPass} setShowPass={setShowPass} />
        <Button type="submit" loading={loading} className="w-full justify-center">Create Admin Account</Button>
      </form>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
      </p>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-3">
        <Link to="/" className="text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">Back to home</Link>
      </p>
    </div>
  )
}
