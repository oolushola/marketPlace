const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    image: {   
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
    // userId: {
    //     type: mongoose.Types.ObjectId,
    //     required: true,
    //     ref: 'User'
    // }
}, { timestamps: true })

const postModel = mongoose.model('Post', postSchema);
module.exports = postModel