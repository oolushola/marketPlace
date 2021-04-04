const Post = require('../models/feeds')
const { validationResult } = require('express-validator')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')

class Feeds {
    static async getPosts(req, res, next) {
        try {
            const currentPage = req.query.page || 1
            const perPage = 1;
            //let totalItems;
            const totalItems = await Post.find().countDocuments()
            const posts =  await Post.find().skip(currentPage - 1 * perPage).limit(perPage).populate('creator')
            console.log(posts)
            return res.status(200).json({
                message: 'post fetched',
                posts: posts,
                totalItems: totalItems
            })
        }
        catch(err) {
            if(!err.statusCode) {
                err.statusCode = 500
                next(err)
            }
        }
        // .then(documents => {
        //     totalItems = documents
        //     return Post
        //         .find()
        //         .skip(currentPage - 1 * perPage)
        //         .limit(perPage)
        // })
        // .then(posts => {
        //     res.status(200).json({
        //         message: 'post fetched',
        //         posts: posts,
        //         totalItems: totalItems
        //     })
        // })
        // .catch(err => {
        //     if(!err.statusCode) {
        //         err.statusCode = 500
        //         next(err)
        //     }
        // })
    }

    static createPost(req, res, next) {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            const error = new Error('Validation failed. Entered data is incorrect')
            error.statusCode = 422
            throw error
        }
        let creator;
        Post
            .findOne({ title: req.body.title })
            .then(feed => {
                if(feed) {
                    // const error = new Error(' post with this title already exists')
                    // error.statusCode = 409
                    // next(error)
                    return res.status(409)
                    .json({
                        error: 'A post with this title alreadt exists'
                    })
                }
                if(!req.file) {
                    const error = new Error('Upload a file')
                    error.statusCode = 422
                    throw error;
                }
                const imageUrl = req.file.path
                const newFeed = new Post({
                    title: req.body.title,
                    content: req.body.content,
                    image: imageUrl,
                    // userId: req.body.creator
                    creator: req.userId
                })
                return newFeed.save()
                .then((feed) => {
                    return User.findById(req.userId)
                })
                .then(user => {
                    creator = user
                    user.posts.push(newFeed)
                    return user.save()
                })
                .then((userResult) => {    
                    return res.status(201)
                    .json({
                        message: 'Post successfully created',
                        post: newFeed,
                        creator: {
                            _id: creator._id,
                            name: creator.name
                        }
                    })
                })
            })
            .catch(err => {
                if(!err.statusCode) {
                    err.statusCode = 500
                }
                next(err)
            })
    }

    static getPost(req, res, next) {
        const postId = req.params.postId;
        Post.findOne({ _id: postId })
            .then(feed => {
                if(!feed) {
                    const error = new Error('Sorry, we do not have what you are looking for')
                    error.statusCode = 404
                    throw error
                }
                res.status(200).json({
                    post: feed,
                    message: 'post fetched'
                })
            })
            .catch(err => {
                if(!err.statusCode) {
                    err.statusCode = 500
                }
                next(err)

            })
    }

    static updatePost(req, res, next) {
        const title = req.body.title
        const content = req.body.content
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            const error = new Error('validation failed, entered data is incorrect')
            error.statusCode = 422
            throw error
        }
        let imageUrl = req.body.image
        if(req.file) {
            imageUrl = req.file.path
        }
        if(!imageUrl) {
            const error = new Error('No file picked')
            error.statusCode = 422
            throw error
        }
        const postId = req.params.postId
        Post.findById(postId)
            .then(feed => {
                if(!feed) {
                    const error = new Error('Page not found')
                    error.statusCode = 404
                    throw error
                }
                if(imageUrl !== feed.image) {
                    clearImage(feed.image)
                }
                feed.title = title
                feed.content = content
                feed.image = imageUrl
                feed.creator = {
                    name: 'Olushola Damilare'
                }
                return feed.save()
            })
            .then(result => {
                res.status(200).json({
                    message: 'post updated successfully.',
                    post: result
                })
            })
            .catch(err => {
                if(!err.statusCode) {
                    err.statusCode = 500
                    next(err)
                }
            })
    }

    static deletePost(req, res, next) {
        const postId = req.params.postId
        Post.findById(postId)
            .then(post => {
                if(!post) {
                    const error = new Error('invalid post id')
                    error.statusCode = 404
                    throw error
                }
                clearImage(post.image)
                return Post.findByIdAndRemove(postId)
            })
            .then(() => {
                res.status(200).json({
                    message: 'post deleted!'
                })
            })
            .catch(err => {
                if(!err.statusCode) {
                    err.statusCode = 500
                    next(err)
                }
            })
    }

    // static clearImage(filePath) {
    //     const imagePath = path.join(__dirname, '..', filePath)
    //     fs.unlink(imagePath, err => {
    //         console.log(err)
    //     })
    // }
}
const clearImage = (filePath) => {
    const imagePath = path.join(__dirname, '..', filePath)
    fs.unlink(imagePath, err => {
        if(err) {
            console.log(err)
        }
    })
}

module.exports = Feeds