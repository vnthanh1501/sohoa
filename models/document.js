const mongoose = require('mongoose')
module.exports = mongoose.model('Document', new mongoose.Schema({
    keyId: {
        type: String,
        unique: true,
        required: true
    },
    id: {
        type: String,
        unique: false, 
        // required: true
    },
    type: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        // required: true
    },
    orgO: {
        type: String,
        // required: true
    },
    orgP: {
        type: String,
        //require: true
    },
    place:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    recv: {
        type: String,
        // required: true
    },
    position: {
        type: String,
        // required: true
    },
    name: {
        type: String,
        // required: true
    }
}))
