import { Router } from 'express'
import * as issues from '../controllers/issuesController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()

router.use(protect, restrictTo('admin'))

router.get('/history', issues.getHistory)
router.get('/overdue', issues.getOverdue)
router.get('/', issues.getIssues)
router.get('/:id', issues.getIssueById)
router.post('/', issues.issueBook)
router.put('/:id/return', issues.returnBook)

export default router
