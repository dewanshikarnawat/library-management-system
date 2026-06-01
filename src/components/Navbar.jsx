import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiBell } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import dashboardService from '../services/dashboardService'

export default function Navbar({ onToggleSidebar, onMobileMenu }) {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    dashboardService.getNotifications()
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications([]))
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 flex items-center gap-4 px-4 md:px-6 flex-shrink-0 relative z-30">
      <button type="button" onClick={onToggleSidebar} className="btn-ghost hidden md:flex p-2">
        <FiMenu size={20} />
      </button>
      <button type="button" onClick={onMobileMenu} className="btn-ghost flex md:hidden p-2">
        <FiMenu size={20} />
      </button>

      <div className="flex-1" />

      <div className="relative">
        <button type="button" onClick={() => setNotifOpen(p => !p)} className="btn-ghost p-2 relative">
          <FiBell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 card shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                <p className="font-semibold text-sm text-surface-800 dark:text-surface-200">Alerts</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-surface-400 text-center">No alerts</p>
                ) : notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 border-b border-surface-50 dark:border-surface-700/50">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{n.title}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ThemeToggle />

      <Link to="/profile">
        <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-md">
          {user?.avatar}
        </div>
      </Link>
    </header>
  )
}
