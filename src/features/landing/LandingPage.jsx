import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiBookOpen, FiArrowRight, FiBook, FiUsers, FiRepeat, FiBarChart2 } from 'react-icons/fi'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { APP_NAME, APP_FULL_NAME } from '../../utils/constants'

const features = [
  { icon: FiBook, title: 'Books', desc: 'Add, edit, and track your library catalog in MongoDB.' },
  { icon: FiUsers, title: 'Members', desc: 'Register members and view their borrowing history.' },
  { icon: FiRepeat, title: 'Issue & Return', desc: 'Issue books with due dates, returns, and overdue fines.' },
  { icon: FiBarChart2, title: 'Reports', desc: 'Dashboard stats and charts from live database data.' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 overflow-x-hidden">
      <nav className="sticky top-0 z-40 glass border-b border-surface-200/50 dark:border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-surface-900 dark:text-surface-50">
            <span className="bg-primary-600 text-white p-1.5 rounded-lg flex-shrink-0"><FiBookOpen size={18} /></span>
            {APP_NAME}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user?.role === 'admin' ? (
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-primary py-2 text-sm">
                Dashboard <FiArrowRight size={15} />
              </button>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-semibold text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400">Sign in</Link>
                <Link to="/register" className="btn-primary py-2 text-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="mesh-bg min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-surface-50 leading-tight mb-6"
          >
            Library Management for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">Administrators</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-lg text-surface-500 dark:text-surface-400 mb-10 max-w-xl mx-auto"
          >
            Sign in to manage books, members, issues, and returns. All data is stored in your MongoDB database—start with an empty library and build it from the admin panel.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-glow inline-flex items-center gap-2">
              Sign Up <FiArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5 inline-flex items-center gap-2">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                <f.icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg text-surface-900 dark:text-surface-50 mb-1">{f.title}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-surface-100 dark:border-surface-800 py-8 px-4 text-center text-sm text-surface-400">
        <p>© {new Date().getFullYear()} {APP_NAME} ({APP_FULL_NAME}) · React + MongoDB</p>
      </footer>
    </div>
  )
}
