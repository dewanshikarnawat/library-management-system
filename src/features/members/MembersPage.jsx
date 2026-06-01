import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import membersService from '../../services/membersService'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { STATUS_COLORS } from '../../utils/constants'
import { normalizeList } from '../../utils/normalize'

export default function MembersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    membersService.getAll()
      .then(({ data }) => { if (!cancelled) setMembers(normalizeList(data)) })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const filtered = useMemo(() => {
    let list = members
    if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.memberId.includes(search))
    if (statusFilter !== 'All') list = list.filter(m => m.status === statusFilter.toLowerCase())
    return list
  }, [members, search, statusFilter])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await membersService.delete(deleteTarget.id)
      setMembers(m => m.filter(x => x.id !== deleteTarget.id))
      toast(`${deleteTarget.name} removed`, 'success')
      setDeleteTarget(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Members" subtitle={`${filtered.length} registered members`}>
        <Button onClick={() => navigate('/members/add')}><FiPlus size={16} /> Add Member</Button>
      </PageHeader>

      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9 py-2 text-sm" placeholder="Search by name, email, ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input py-2 text-sm w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {['All', 'Active', 'Inactive', 'Suspended'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FiSearch} title="No members found" description="Try adjusting your search" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                {['Member', 'ID', 'Email', 'Account', 'Joined', 'Books Issued', 'Status', 'Actions'].map(h => (
                  <th key={h} className="table-head">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, i) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="table-row"
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {member.avatar}
                      </div>
                      <span className="font-semibold">{member.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-primary-600 dark:text-primary-400">{member.memberId}</td>
                  <td className="table-cell">{member.email}</td>
                  <td className="table-cell">
                    {member.accountRole === 'admin' ? (
                      <Badge variant="info">Admin</Badge>
                    ) : member.accountRole === 'member' ? (
                      <Badge variant="default">Member</Badge>
                    ) : (
                      <span className="text-xs text-surface-400">—</span>
                    )}
                  </td>
                  <td className="table-cell">{formatDate(member.joinDate)}</td>
                  <td className="table-cell text-center">{member.booksIssued}</td>
                  <td className="table-cell">
                    <Badge variant={STATUS_COLORS[member.status]}>{member.status}</Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/members/${member.id}`)} className="btn-ghost p-1.5"><FiEye size={14} /></button>
                      <button onClick={() => navigate(`/members/edit/${member.id}`)} className="btn-ghost p-1.5 text-primary-600 dark:text-primary-400"><FiEdit2 size={14} /></button>
                      <button onClick={() => setDeleteTarget(member)} className="btn-ghost p-1.5 text-red-500"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Member"
        message={`Remove "${deleteTarget?.name}" from the system? This cannot be undone.`}
      />
    </div>
  )
}
