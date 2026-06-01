import React from 'react'
import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <Icon size={28} className="text-surface-400" />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg text-surface-700 dark:text-surface-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-surface-400 dark:text-surface-500 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}