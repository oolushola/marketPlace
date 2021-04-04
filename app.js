const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const FeedRoutes = require('./routes/feed')
const AuthRoutes = require('./routes/auth')
const path = require('path')

const PORT = 8080
const CONNECTION_URI = 'mongodb://127.0.0.1:27017/newsfeeds?compressors=zlib&readPreference=primary&gssapiServiceName=mongodb&appname=MongoDB%20Compass&ssl=false'

const app = express()
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString()+'-'+file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else{
        cb(null, false)
    }
}

app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use(AuthRoutes)
app.use(FeedRoutes)
app.get('/', (req, res, next) => {
    return res.status(200).json({
        status: 200,
        data: 'Welcome to the post feed API'
    })
})

app.use('*', (req, res, next) => {
    return res.status(404).json({
        status: 404,
        data: 'Page not found'
    })
})

app.use((error, req, res, next) => {
    const status = error.statusCode || 500
    const message = error.message
    const errorData = error.data
    res.status(status).json({
        message: message,
        data: errorData
    })
})

mongoose.connect(CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
})
.then((client) => {
    app.listen(PORT, () => {
        console.log(`SERVER RUNNING ON PORT ${PORT}`)
    })
})
.catch(err => {
    console.log(err)
})