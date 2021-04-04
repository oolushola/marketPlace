const express = require('express')
const router = express.Router()
const AuhtController = require('../controllers/auth')
const { body } = require('express-validator')
const User = require('../models/user')

//router.get()
router.post(
    '/signup',
    [
        body('name').isString().isLength({ min: 5 }).trim(),
        body('email').isEmail().trim()
        .custom((value, { req }) => {
            return User
            .findOne({ email: value })
                .then(userDoc => {
                    if(userDoc) {
                        return Promise.reject('Email address already in use')
                    }
            })
        })
        .normalizeEmail(),
        body('password').isLength({ min: 5 }).trim(),
        body('confirmPassword').trim().custom((value, { req }) => {
            if(value === req.body.password) {
                throw new Error('Password does not match')
            }
            return true
        })
    ],
    AuhtController.register
 )
 router.post(
     '/login', 
     [
         body('email')
            .isEmail()
            .trim()
            .custom((value, { req }) => {
                return User.findOne({ email: req.body.email })
                    .then(userDoc => {
                        if(!userDoc) {
                            return Promise.reject()
                        }
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 })
     ], 
     AuhtController.login
    )

module.exports = router