import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiRepeat, FiCornerDownLeft, FiAlertCircle, FiUserPlus, FiBook } from 'react-icons/fi'
import dashboardService from '../../services/dashboardService'
import { useToast } from '../../context/ToastContext'
import { getRelativeTime } from '../../utils/formatDate'

const icons = {
  issue: { icon: FiRepeat, cls: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
  return: { icon: FiCornerDownLeft, cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  overdue: { icon: FiAlertCircle, cls: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' },
  member: { icon: FiUserPlus, cls: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400' },
  book: { icon: FiBook, cls: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
}

export default function ActivityTimeline() {
  const { toast } = useToast()
  const [activity, setActivity] = useState([])

  useEffect(() => {
    dashboardService.getActivity()
      .then(({ data }) => setActivity(data))
      .catch(err => toast(err.message, 'error'))
  }, [toast])

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200">Recent Activity</h3>
        <p className="text-xs text-surface-400 mt-0.5">Latest library events</p>
      </div>
      <div className="relative space-y-0">
        {activity.length === 0 ? (
          <p className="text-sm text-surface-400 py-4">No recent activity.</p>
        ) : activity.map((item, i) => {
          const { icon: Icon, cls } = icons[item.type] || icons.book
          const timeLabel = item.time?.includes('ago') || item.time === 'Just now'
            ? item.time
            : getRelativeTime(item.time)
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-3 py-3 relative"
            >
              {i < activity.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-px bg-surface-100 dark:bg-surface-700" />
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${cls}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-surface-700 dark:text-surface-300 leading-snug">{item.text}</p>
                <p className="text-xs text-surface-400 mt-0.5">{timeLabel}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
