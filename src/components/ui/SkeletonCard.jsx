import React from 'react'

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-surface-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-24" />
          <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

const SKELETON_WIDTHS = ['72%', '85%', '68%', '90%', '76%']

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {SKELETON_WIDTHS.map((width, i) => (
        <td key={i} className="table-cell">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded" style={{ width }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card overflow-hidden">
      <div className="animate-pulse p-4 border-b border-surface-100 dark:border-surface-700">
        <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-48" />
      </div>
      <table className="w-full">
        <tbody>
          {[...Array(rows)].map((_, i) => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    </div>
  )
}