import { Router } from 'express'
import * as dashboard from '../controllers/dashboardController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()

router.use(protect, restrictTo('admin'))

router.get('/stats', dashboard.getStats)
router.get('/monthly', dashboard.getMonthlyStats)
router.get('/categories', dashboard.getCategoryStats)
router.get('/activity', dashboard.getActivity)
router.get('/notifications', dashboard.getNotifications)

export default router
