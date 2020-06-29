const documentModel = require('../models/document')
const imageModel = require('../models/image')
const stampModel = require('../models/stamp')
const { generateDocx } = require('./modules/docx-generator')

module.exports = {
    create: (req, res) => {
        documentModel.create({
            keyId: req.body.keyId,
            id: req.body.id, type: req.body.type,
            abstract: req.body.abstract, 
            content: req.body.content,
            place: req.body.place,
            date: req.body.date,
            recv: req.body.recv,
            name: req.body.name,
            position: req.body.position,
            orgO: req.body.orgO,
            orgP: req.body.orgP
        },
            (err, result) => {
                if (err) {
                    console.log('Đã xảy ra lỗi: ' + err.message)
                    res.send({ type: 'danger', message: "Đã có lỗi xảy ra" })
                }
                else {
                    imageModel.create({ keyId: req.body.keyId, images: req.body.images }, (err, result) => {
                        if (err) {
                            console.log('Đã xảy ra lỗi: ' + err.message)
                        }
                    })
                    stampModel.create({ keyId: req.body.keyId, stamp: req.body.stamp }, (err, result) => {
                        if (err) {
                            console.log('Đã xảy ra lỗi: ' + err.message)
                        } else
                            console.log("Tạo thành công văn bản mã: " + req.body.keyId)
                    })
                    res.send({ type: 'success', message: "Đã lưu văn bản" })
                }
            })
    },
    update: (req, res) => {
        documentModel.updateOne({ keyId: req.params.id }, { '$set': { 'id': req.body.id, 'type': req.body.type, 'abstract': req.body.abstract, 'content': req.body.content, 'place': req.body.place, 'date': req.body.date, 'recv': req.body.recv, 'name': req.body.name, 'stamp': req.body.stamp, 'position': req.body.position, 'orgO': req.body.orgO, 'orgP': req.body.orgP } }, (err, result) => {
            if (err) {
                res.send({ type: 'danger', message: 'Dữ liệu nhập có vấn đề' })
                console.log('Đã xảy ra lỗi: ' + err.message)
            }
            else {
                res.send({ type: 'success', message: 'Dữ liệu đã được cập nhật' })
                console.log('Văn bản ' + req.params.id + 'đã được chỉnh sửa')
            }
        })
    },

    delete: (req, res) => {
        documentModel.deleteMany({ keyId: req.params.id }, (err, result) => {
            if (err) {
                res.send({ type: 'danger', message: 'Không thể xóa dữ liệu' })
                console.log('Đã xảy ra lỗi: ' + err.message)
            }
            else {
                imageModel.deleteMany({ keyId: req.params.id }, (err, result) => {
                    if (err) {
                        console.log('Đã xảy ra lỗi: ' + err.message)
                    }
                })
                stampModel.deleteMany({ keyId: req.params.id }, (err, result) => {
                    if (err) {
                        console.log('Đã xảy ra lỗi: ' + err.message)
                    }
                    else {
                        console.log("Đã xóa văn bản: " + req.params.id)
                    }
                })
                res.send({ type: 'success', message: 'Xóa dữ liệu thành công' })
            }
        })
    },

    getImage: (req, res) => {
        imageModel.find({ keyId: req.params.id }, (err, result) => {
            res.json(result[0])
        })
    },

    getStamp: (req, res) => {
        stampModel.find({ keyId: req.params.id }, (err, result) => {
            res.json(result[0])
        })
    },

    getAll: (req, res) => {
        documentModel.find({}, (err, result) => {
            res.json(result)
        })
    },

    export: async (req, res) => {
        await generateDocx(req, res)
    }
};
