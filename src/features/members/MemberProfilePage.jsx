import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiShield } from 'react-icons/fi'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import membersService from '../../services/membersService'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { STATUS_COLORS } from '../../utils/constants'
import { normalizeRecord, normalizeIssues } from '../../utils/normalize'

export default function MemberProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [member, setMember] = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [promotePassword, setPromotePassword] = useState('')
  const [promoting, setPromoting] = useState(false)

  const canPromote = member && member.accountRole !== 'admin'
  const needsPasswordForPromote = member && !member.hasLoginAccount

  useEffect(() => {
    let cancelled = false
    Promise.all([
      membersService.getById(id),
      membersService.getIssuedBooks(id),
    ])
      .then(([memberRes, issuesRes]) => {
        if (cancelled) return
        setMember(normalizeRecord(memberRes.data))
        setIssues(normalizeIssues(issuesRes.data))
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!member) return <div className="text-center py-20 text-surface-400">Member not found</div>

  const handlePromote = async () => {
    if (needsPasswordForPromote && promotePassword.length < 6) {
      toast('Enter a password of at least 6 characters', 'error')
      return
    }
    setPromoting(true)
    try {
      const { data } = await membersService.promoteToAdmin(
        member.id,
        needsPasswordForPromote ? promotePassword : undefined
      )
      setMember(normalizeRecord(data))
      setPromoteOpen(false)
      setPromotePassword('')
      toast(`${member.name} can now sign in as administrator`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setPromoting(false)
    }
  }

  const accountBadge = () => {
    if (member.accountRole === 'admin') {
      return <Badge variant="info" className="mt-2"><FiShield size={12} /> Administrator</Badge>
    }
    if (member.accountRole === 'member') {
      return <Badge variant="default" className="mt-2">Member login</Badge>
    }
    return <Badge variant="warning" className="mt-2">No login account</Badge>
  }

  return (
    <div>
      <PageHeader title="Member Profile">
        <Button variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={16} /> Back</Button>
        <Button onClick={() => navigate(`/members/edit/${member.id}`)}><FiEdit2 size={16} /> Edit</Button>
        {canPromote && (
          <Button variant="secondary" onClick={() => setPromoteOpen(true)}>
            <FiShield size={16} /> Promote to Admin
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {member.avatar}
          </div>
          <h2 className="font-display font-bold text-xl text-surface-900 dark:text-surface-50">{member.name}</h2>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-mono mt-1">{member.memberId}</p>
          <Badge variant={STATUS_COLORS[member.status]} className="mt-3 text-sm px-4 py-1">{member.status}</Badge>
          {accountBadge()}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-surface-50 dark:bg-surface-900 rounded-xl p-3">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{member.booksIssued}</p>
              <p className="text-xs text-surface-400 mt-0.5">Currently Issued</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-900 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-500">{issues.filter(i => i.status === 'returned').length}</p>
              <p className="text-xs text-surface-400 mt-0.5">Returned</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: FiMail, label: 'Email', value: member.email },
                { icon: FiPhone, label: 'Phone', value: member.phone },
                { icon: FiMapPin, label: 'Address', value: member.address },
                { icon: FiCalendar, label: 'Joined', value: formatDate(member.joinDate) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">{label}</p>
                    <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-4">Issue History</h3>
            {issues.length === 0 ? (
              <p className="text-sm text-surface-400">No issue records.</p>
            ) : (
              <div className="space-y-2">
                {issues.map(issue => (
                  <div key={issue.id} className="flex items-center justify-between py-2.5 border-b border-surface-100 dark:border-surface-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <FiBook size={15} className="text-primary-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{issue.bookTitle}</p>
                        <p className="text-xs text-surface-400">{formatDate(issue.issueDate)} → {formatDate(issue.dueDate)}</p>
                      </div>
                    </div>
                    <Badge variant={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Modal isOpen={promoteOpen} onClose={() => !promoting && setPromoteOpen(false)} title="Promote to Administrator" size="sm">
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
          {needsPasswordForPromote
            ? `${member.name} has no login yet. Set a password so they can sign in as admin.`
            : `${member.name} will be upgraded from member to administrator and can use the same email and password to sign in.`}
        </p>
        {needsPasswordForPromote && (
          <div className="mb-4">
            <label className="label">New login password</label>
            <input
              type="password"
              className="input"
              placeholder="Minimum 6 characters"
              value={promotePassword}
              onChange={e => setPromotePassword(e.target.value)}
            />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setPromoteOpen(false)} disabled={promoting}>Cancel</Button>
          <Button onClick={handlePromote} loading={promoting}>
            <FiShield size={15} /> Confirm promotion
          </Button>
        </div>
      </Modal>
    </div>
  )
}
