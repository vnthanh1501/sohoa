const userModel = require('../models/user')
require('../config/database')

userModel.create({
    username: 'admin',
    password: 'admin',
    role: 'admin'
},
    (err, result) => {
        if (err) {
            console.log('Đã xảy ra lỗi: ' + err.message)
        }
        else {
            console.log('Đã tạo thành công user: admin với password: admin')
        }
    })