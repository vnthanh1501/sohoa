const userModel = require('../models/user')
const jwt = require('jsonwebtoken')

const secret = 'mysecretsshhh'
module.exports = {
    register: (req, res) => {
        userModel.create({
            username: req.body.username,
            password: req.body.password,
            role: req.body.role
            // username: 'admin',
            // password: 'admin'
        },
            (err, result) => {
                if (err) {
                    console.log('Đã xảy ra lỗi: ' + err.message)
                    res.send({ type: 'danger', message: "Đã xảy ra lỗi: " + err.message })
                }
                else {
                    console.log('OK')
                    res.send({ type: 'success', message: "Đã tạo thành công tài khoản: " + req.body.username })
                }
            })
    },
    checkToken: (req, res) => {
        res.status(200).send({ username: req.username, role: req.role })
    },
    getInfo: (req, res) => {
        res.send({ username: req.username, role: req.role })
    },
    authenticate: async (req, res) => {
        const { username, password } = req.body;
        userModel.findOne({ username }, function (err, user) {
            if (err) {
                console.error(err);
                res.status(500)
                    .json({
                        error: 'Internal error please try again'
                    });
            } else if (!user) {
                res.status(401)
                    .json({
                        error: 'Incorrect username or password'
                    });
            } else {
                user.isCorrectPassword(password, function (err, same) {
                    if (err) {
                        res.status(500)
                            .json({
                                error: 'Internal error please try again'
                            });
                    } else if (!same) {
                        res.status(401)
                            .json({
                                error: 'Incorrect username or password'
                            });
                    } else {
                        // Issue token
                        const payload = { username, role: user.role };
                        const token = jwt.sign(payload, secret, {
                            expiresIn: '1h'
                        });
                        res.cookie('token', token, { httpOnly: true })
                            .send({ status: 200, role: user.role })
                    }
                });
            }
        });
    },
    logout: (req, res) => {
        res.clearCookie('token').end()
    },
    getAll: (req, res) => {
        userModel.find({}, (err, result) => {
            res.json(result)
        })
    },
    update: (req, res) => {
        userModel.find({ username: req.params.id }, function (err, user) {
            if (err) {
                res.send({ type: 'danger', message: 'Dữ liệu nhập có vấn đề' })
                console.log('Đã xảy ra lỗi: ' + err.message)
            }

            user[0].password = req.body.password;
            user[0].save(function (err) {
                if (err) {
                    res.send({ type: 'danger', message: 'Dữ liệu nhập có vấn đề' })
                    console.log('Đã xảy ra lỗi: ' + err.message)
                }
                res.send({ type: 'success', message: 'Dữ liệu đã được cập nhật' })
                console.log('Mật khẩu tài khoản: ' + req.params.id + ' đã được chỉnh sửa')
            });
        });
    },
    delete: (req, res) => {
        userModel.deleteMany({ username: req.params.id }, (err, result) => {
            if (err) {
                res.send({ type: 'danger', message: 'Không thể xóa dữ liệu' })
                console.log('Đã xảy ra lỗi: ' + err.message)
            }
            else {
                res.send({ type: 'success', message: 'Xóa dữ liệu thành công' })
            }
        })
    },
};
