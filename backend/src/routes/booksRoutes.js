import { Router } from 'express'
import * as books from '../controllers/booksController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()

router.use(protect, restrictTo('admin'))

router.get('/search', books.searchBooks)
router.get('/category', books.getByCategory)
router.get('/popular', books.getPopular)
router.get('/recent', books.getRecent)
router.get('/', books.getBooks)
router.get('/:id', books.getBookById)
router.post('/', books.createBook)
router.put('/:id', books.updateBook)
router.delete('/:id', books.deleteBook)

export default router
