const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class Auth {
    static async register(req, res, next) {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password

        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            const error = new Error('Validation failed')
            error.statusCode = 422
            error.data = errors.array()
            throw error

        }
        try {
            const hashedPassword_ = await bcrypt.hash(password, 12)
            const newUser = new User({
                email: email,
                password: hashedPassword_,
                name: name,
                status: 'I am new'
            })
            const user = await newUser.save()
            res.status(201).json({
                message: 'User account created successfully',
                data: user,
                userId: user._id
            })
        }
        catch(err) {
            if(!err.statusCode) {
                err.statusCode = 500
                next(err)
            }
        }
        // bcrypt.hash(password, 12)
        //     .then(hashedPassword => {
        //         const user = new User({
        //             email: email,
        //             password: hashedPassword,
        //             name: name,
        //             status: 'I am new'
        //         })
        //         return user.save()
        //     })
        //     .then(userAccount => {
        //         res.status(201).json({
        //             message: 'User account created successfully',
        //             data: userAccount,
        //             userId: userAccount._id
        //         })
        //     })
        //     .catch(err => {
        //         if(!err.statusCode) {
        //             err.statusCode = 500
        //             next(err)
        //         }
        //     })
    }

    static login(req, res, next) {
        const email  = req.body.email
        const password = req.body.password
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            const error = new Error('Validation error!')
            error.statusCode = 422
            error.data = errors.array()
            throw error
        }

        User
            .findOne({ email: email })
            .then(user => {
                return bcrypt.compare(password, user.password)
                    .then(doMatch => {
                        if(!doMatch) {
                            const error = new Error('Not matched')
                            error.statusCode = 404
                            throw error
                        }
                        const token = jwt.sign({ 
                            email: user.email, 
                            userId: user._id.toString()
                        },
                        'mysuperScretSecret',
                        { expiresIn: '1h' })
                    
                        res.status(200).json({
                            token: token,
                            userId: user._id.toString(),
                        })
                    })
            })
            .catch(err => {
                if(!err.statusCode) {
                    err.statusCode = 500
                    next(err)
                }
            })
    }
}

module.exports = Auth