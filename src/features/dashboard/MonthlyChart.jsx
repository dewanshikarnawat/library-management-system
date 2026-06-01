import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import dashboardService from '../../services/dashboardService'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-surface-700 dark:text-surface-200 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function MonthlyChart() {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const [data, setData] = useState([])
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  useEffect(() => {
    dashboardService.getMonthly()
      .then(({ data: monthly }) => setData(monthly))
      .catch(err => toast(err.message, 'error'))
  }, [toast])

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200">Monthly Issue & Return</h3>
        <p className="text-xs text-surface-400 mt-0.5">Book activity over the past 12 months</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="issued" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="returned" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Area type="monotone" dataKey="issued" name="Issued" stroke="#0ea5e9" strokeWidth={2} fill="url(#issued)" dot={false} />
          <Area type="monotone" dataKey="returned" name="Returned" stroke="#f97316" strokeWidth={2} fill="url(#returned)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
