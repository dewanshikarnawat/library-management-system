import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import dashboardService from '../../services/dashboardService'
import { useToast } from '../../context/ToastContext'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-lg">
      <p className="font-semibold text-surface-800 dark:text-surface-200">{d.name}</p>
      <p style={{ color: d.payload.color }} className="font-bold">{d.value} books</p>
    </div>
  )
}

export default function CategoryPieChart() {
  const { toast } = useToast()
  const [data, setData] = useState([])

  useEffect(() => {
    dashboardService.getCategories()
      .then(({ data: categories }) => setData(categories))
      .catch(err => toast(err.message, 'error'))
  }, [toast])

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200">Books by Category</h3>
        <p className="text-xs text-surface-400 mt-0.5">Distribution across genres</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={entry.name || i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
