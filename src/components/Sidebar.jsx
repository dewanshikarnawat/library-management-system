import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiBookOpen, FiHome, FiBook, FiUsers, FiRepeat, FiBarChart2,
  FiUser, FiSettings, FiLogOut, FiX, FiClock
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { APP_NAME } from '../utils/constants'

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/books', icon: FiBook, label: 'Books' },
  { to: '/members', icon: FiUsers, label: 'Members' },
  { to: '/issue', icon: FiRepeat, label: 'Issue Book' },
  { to: '/return', icon: FiRepeat, label: 'Return Book' },
  { to: '/history', icon: FiClock, label: 'Issue History' },
  { to: '/reports', icon: FiBarChart2, label: 'Reports' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
]

export default function Sidebar({ collapsed = false, onClose }) {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast('Logged out successfully', 'success')
    navigate('/login')
  }

  return (
    <aside className="h-full bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 flex flex-col">
      <div className="flex items-center justify-between px-4 py-5 border-b border-surface-100 dark:border-surface-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="bg-primary-600 text-white p-1.5 rounded-lg flex-shrink-0">
              <FiBookOpen size={18} />
            </span>
            <span className="font-display font-bold text-lg text-surface-900 dark:text-surface-50">{APP_NAME}</span>
          </div>
        )}
        {collapsed && <span className="bg-primary-600 text-white p-1.5 rounded-lg mx-auto"><FiBookOpen size={18} /></span>}
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1 ml-auto">
            <FiX size={18} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 truncate">{user?.name}</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Administrator</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <NavLink
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-surface-100 dark:border-surface-800">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <FiLogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
