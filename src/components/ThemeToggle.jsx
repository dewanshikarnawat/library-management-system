import React from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center transition-colors duration-300 flex-shrink-0"
      aria-label="Toggle theme"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`absolute w-5 h-5 rounded-full flex items-center justify-center shadow-md text-xs
          ${isDark ? 'bg-primary-500 translate-x-6' : 'bg-white translate-x-0.5'}`}
      >
        {isDark ? <FiMoon size={11} className="text-white" /> : <FiSun size={11} className="text-amber-500" />}
      </motion.span>
    </motion.button>
  )
}