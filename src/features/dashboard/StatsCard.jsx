import React from 'react'
import { motion } from 'framer-motion'

export default function StatsCard({ title, value, icon: Icon, color, trend, trendLabel, delay = 0 }) {
  const colors = {
    blue:   { bg: 'bg-primary-50 dark:bg-primary-900/20', icon: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400', text: 'text-primary-600 dark:text-primary-400', border: 'border-primary-100 dark:border-primary-800/30' },
    orange: { bg: 'bg-accent-50 dark:bg-accent-900/20',   icon: 'bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400',   text: 'text-accent-600 dark:text-accent-400',   border: 'border-accent-100 dark:border-accent-800/30' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800/30' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',         icon: 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400',                 text: 'text-red-500 dark:text-red-400',         border: 'border-red-100 dark:border-red-800/30' },
    purple: { bg: 'bg-violet-50 dark:bg-violet-900/20',   icon: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',     text: 'text-violet-600 dark:text-violet-400',   border: 'border-violet-100 dark:border-violet-800/30' },
  }
  const c = colors[color] || colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`card p-5 ${c.bg} border ${c.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">{title}</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
            className="font-display text-3xl font-bold text-surface-900 dark:text-surface-50"
          >
            {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
          </motion.p>
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel || ''}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  )
}