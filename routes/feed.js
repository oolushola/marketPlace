const express = require('express')
const router = express.Router()
const FeedsController = require('../controllers/feed')
const { body } = require('express-validator')
// const validator = require('../utils/middleware/validation')
const verifyToken = require('../utils/middleware/is-auth')

router.get('/posts', verifyToken, FeedsController.getPosts);
router.post('/posts', verifyToken,
    [
        body('title').isLength({ min: 5}).isString().trim(),
        body('content').isLength({ min: 5}).isString().trim()
    ],
    FeedsController.createPost
)
router.get('/post/:postId', verifyToken, FeedsController.getPost)
router.put('/post/:postId/', verifyToken,
    [
        body('title').isLength({ min: 5}).isString().trim(),
        body('content').isLength({ min: 5}).isString().trim()
    ], 
    FeedsController.updatePost
)
router.delete('/post/:postId', verifyToken, FeedsController.deletePost)

module.exports = router