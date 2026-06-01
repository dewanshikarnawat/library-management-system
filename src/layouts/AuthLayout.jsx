import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'
import { FiBookOpen } from 'react-icons/fi'
import { APP_NAME, APP_FULL_NAME } from '../utils/constants'

export default function AuthLayout() {
  return (
    <div className="min-h-screen mesh-bg bg-surface-50 dark:bg-surface-950 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-surface-900 dark:text-surface-50">
          <span className="bg-primary-600 text-white p-1.5 rounded-lg"><FiBookOpen size={18} /></span>
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
      <footer className="text-center pb-6 text-xs text-surface-400 dark:text-surface-600">
        © {new Date().getFullYear()} {APP_NAME} — {APP_FULL_NAME}. All rights reserved.
      </footer>
    </div>
  )
}