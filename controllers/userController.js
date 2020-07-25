const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

const secret = 'mysecretsshhh'
module.exports = {
    post_create: (req, res) => {
        userModel.create({
            username: req.body.username,
            password: req.body.password,
            role: req.body.role
        },
            (err, result) => {
                if (err) {
                    console.log('An error has occurred: ' + err.message)
                    res.send({ type: 'danger', message: "An error has occurred: " + err.message })
                }
                else {
                    console.log('OK')
                    res.send({ type: 'success', message: "The user has been created: " + req.body.username })
                }
            })
    },
    logout: (req, res) => {
        res.clearCookie('token').end()
    },
    checkToken: (req, res) => {
        res.status(200).send({ username: req.username, role: req.role })
    },
    get_info: (req, res) => {
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
    get_all: (req, res) => {
        userModel.find({}, (err, result) => {
            res.json(result)
        })
    },
    put_changePassword: (req, res) => {
        userModel.find({ username: req.params.id }, function (err, user) {
            if (err) {
                res.send({ type: 'danger', message: 'Input problem' })
                console.log('An error has occurred: ' + err.message)
            }

            user[0].password = req.body.password;
            user[0].save(function (err) {
                if (err) {
                    res.send({ type: 'danger', message: 'Input problem' })
                    console.log('An error has occurred: ' + err.message)
                }
                res.send({ type: 'success', message: 'The password has been updated' })
                console.log('The password of the user: ' + req.params.id + ' has been updated')
            });
        });
    },
    delete_remove: (req, res) => {
        userModel.deleteMany({ username: req.params.id }, (err, result) => {
            if (err) {
                res.send({ type: 'danger', message: 'Cannot remove the user' })
                console.log('An error has occurred: ' + err.message)
            }
            else {
                res.send({ type: 'success', message: 'The user has been removed' })
            }
        })
    },
};
