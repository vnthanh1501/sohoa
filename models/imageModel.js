const mongoose = require('mongoose')
module.exports = mongoose.model('Image', new mongoose.Schema({
    keyId: {
        type: String,
        unique: true,
        required: true
    },
    images: {
        type: [String], 
        required: true
    }
}))