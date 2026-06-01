import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBook, FiCheckSquare, FiRepeat, FiAlertCircle, FiUsers } from 'react-icons/fi'
import StatsCard from './StatsCard'
import MonthlyChart from './MonthlyChart'
import CategoryPieChart from './CategoryPieChart'
import ActivityTimeline from './ActivityTimeline'
import QuickActions from './QuickActions'
import PageHeader from '../../components/PageHeader'
import { SkeletonCard } from '../../components/ui/SkeletonCard'
import dashboardService from '../../services/dashboardService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    dashboardService.getStats()
      .then(({ data }) => { if (!cancelled) setStats(data) })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const cards = [
    { title: 'Total Books', key: 'totalBooks', icon: FiBook, color: 'blue' },
    { title: 'Available Copies', key: 'availableBooks', icon: FiCheckSquare, color: 'green' },
    { title: 'Issued', key: 'issuedBooks', icon: FiRepeat, color: 'orange' },
    { title: 'Overdue', key: 'overdueBooks', icon: FiAlertCircle, color: 'red' },
    { title: 'Total Members', key: 'totalMembers', icon: FiUsers, color: 'purple' },
  ]

  return (
    <div>
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening in your library today"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {loading
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c, i) => (
              <StatsCard
                key={c.key}
                title={c.title}
                value={stats?.[c.key]}
                icon={c.icon}
                color={c.color}
                delay={i * 0.07}
              />
            ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
        <QuickActions />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-2">
          <MonthlyChart />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <CategoryPieChart />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <ActivityTimeline />
      </motion.div>
    </div>
  )
}
