const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        required: true,
        type: String
    },
    status: {
        type: String,
        required: true
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        ref: 'Post'
    }]

})

const userModel = mongoose.model('User', UserSchema)
module.exports = userModel