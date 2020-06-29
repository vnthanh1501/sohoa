const mongoose = require('mongoose')
module.exports = mongoose.model('Stamp', new mongoose.Schema({
    keyId: {
        type: String,
        unique: true,
        required: true
    },
    stamp: {
        type: String, 
        // required: true
    }
}))