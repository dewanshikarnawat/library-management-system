import { Router } from 'express'
import * as auth from '../controllers/authController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()

router.post('/register', auth.register)
router.post('/login', auth.login)
router.post('/logout', protect, restrictTo('admin'), auth.logout)
router.get('/profile', protect, restrictTo('admin'), auth.getProfile)
router.put('/profile', protect, restrictTo('admin'), auth.updateProfile)
router.put('/change-password', protect, restrictTo('admin'), auth.changePassword)

export default router
