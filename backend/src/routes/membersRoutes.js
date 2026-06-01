import { Router } from 'express'
import * as members from '../controllers/membersController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()

router.use(protect, restrictTo('admin'))

router.get('/', members.getMembers)
router.get('/:id/issues', members.getMemberIssues)
router.put('/:id/promote-admin', members.promoteMemberToAdmin)
router.get('/:id', members.getMemberById)
router.post('/', members.createMember)
router.put('/:id', members.updateMember)
router.delete('/:id', members.deleteMember)

export default router
