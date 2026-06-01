import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlusCircle, FiRepeat, FiCornerDownLeft, FiUsers, FiBarChart2 } from 'react-icons/fi'

const actions = [
  { label: 'Add Book', icon: FiPlusCircle, to: '/books/add', color: 'bg-primary-600 hover:bg-primary-700 shadow-glow' },
  { label: 'Issue Book', icon: FiRepeat, to: '/issue', color: 'bg-accent-500 hover:bg-accent-600 shadow-glow-accent' },
  { label: 'Return Book', icon: FiCornerDownLeft, to: '/return', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Add Member', icon: FiUsers, to: '/members/add', color: 'bg-violet-600 hover:bg-violet-700' },
  { label: 'View Reports', icon: FiBarChart2, to: '/reports', color: 'bg-surface-700 hover:bg-surface-800 dark:bg-surface-600 dark:hover:bg-surface-500' },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(action.to)}
            className={`${action.color} text-white rounded-2xl py-4 px-3 flex flex-col items-center gap-2 transition-all duration-200`}
          >
            <action.icon size={22} />
            <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
