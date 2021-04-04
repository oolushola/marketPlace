const { body } = require('express-validator')

class Validator {
    static validateCreatePost(req, res, next) {
        [
            body('title').isString().trim().isLength({ min: 7 }),
            body('content').isString().trim().isLength({ min: 7 })
        ]
        return next()
    }
}

module.exports = Validator