import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

function readStoredUser() {
  if (!localStorage.getItem('lms_token')) return null
  try {
    const stored = localStorage.getItem('lms_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(!!localStorage.getItem('lms_token'))

  useEffect(() => {
    const token = localStorage.getItem('lms_token')
    if (!token) {
      setBootstrapping(false)
      return
    }
    authService.getProfile()
      .then(({ data }) => {
        if (data.user.role !== 'admin') {
          throw new Error('Not admin')
        }
        setUser(data.user)
        localStorage.setItem('lms_user', JSON.stringify(data.user))
      })
      .catch(() => {
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user')
        setUser(null)
      })
      .finally(() => setBootstrapping(false))
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await authService.login(email, password)
      if (data.user.role !== 'admin') {
        throw new Error('Only administrators can sign in')
      }
      localStorage.setItem('lms_token', data.token)
      localStorage.setItem('lms_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const { data } = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      if (data.user.role !== 'admin') {
        throw new Error('Registration failed')
      }
      localStorage.setItem('lms_token', data.token)
      localStorage.setItem('lms_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    const token = localStorage.getItem('lms_token')
    if (token) authService.logout().catch(() => {})
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setUser(null)
  }

  const updateProfile = async (updates) => {
    const { data } = await authService.updateProfile(updates)
    setUser(data.user)
    localStorage.setItem('lms_user', JSON.stringify(data.user))
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, bootstrapping, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
