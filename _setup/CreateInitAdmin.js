const userModel = require('../models/userModel')
require('../config/database')

userModel.create({
    username: 'admin',
    password: 'admin',
    role: 'admin'
},
    (err, result) => {
        if (err) {
            console.log('An error has occurred: ' + err.message)
        }
        else {
            console.log('A new user has been created: admin - password: admin')
        }
    })