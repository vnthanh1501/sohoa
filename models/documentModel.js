const mongoose = require('mongoose')
module.exports = mongoose.model('Document', new mongoose.Schema({
    keyId: {
        type: String,
        unique: true,
        required: true
    },
    id: {
        type: String,
        unique: false
    },
    type: {
        type: String
    },
    abstract: {
        type: String
    },
    orgO: {
        type: String
    },
    orgP: {
        type: String
    },
    place:{
        type: String
    },
    date: {
        type: Date
    },
    content: {
        type: String
    },
    recv: {
        type: String
    },
    position: {
        type: String
    },
    stamp: {
        type: String
    },
    name: {
        type: String
    },
    creator: {
        type: String
    }
}))
