const documentModel = require('../models/documentModel')
const imageModel = require('../models/imageModel')
const { generateDoc } = require('./modules/doc-generator')

module.exports = {
    post_create: (req, res) => {
        documentModel.create({
            keyId: req.body.keyId,
            id: req.body.id, type: req.body.type,
            abstract: req.body.abstract, 
            content: req.body.content,
            place: req.body.place,
            date: req.body.date,
            recv: req.body.recv,
            stamp: req.body.stamp,
            name: req.body.name,
            position: req.body.position,
            orgO: req.body.orgO,
            orgP: req.body.orgP,
            creator: req.username
        },
            (err, result) => {
                if (err) {
                    console.log('An error has occurred: ' + err.message)
                    res.send({ type: 'danger', message: "An error has occurred" })
                }
                else {
                    imageModel.create({ keyId: req.body.keyId, images: req.body.images }, (err, result) => {
                        if (err) {
                            console.log('An error has occurred: ' + err.message)
                        }
                    })
                    res.send({ type: 'success', message: "The data has been created" })
                }
            })
    },
    put_edit: (req, res) => {
        documentModel.updateOne({ keyId: req.params.id }, { '$set': { 'id': req.body.id, 'type': req.body.type, 'abstract': req.body.abstract, 'content': req.body.content, 'place': req.body.place, 'date': req.body.date, 'recv': req.body.recv, 'name': req.body.name, 'stamp': req.body.stamp, 'position': req.body.position, 'orgO': req.body.orgO, 'orgP': req.body.orgP } }, (err, result) => {
            if (err) {
                res.send({ type: 'danger', message: 'Input problem' })
                console.log('An error has occurred: ' + err.message)
            }
            else {
                res.send({ type: 'success', message: 'The data has been updated' })
                console.log('Document ' + req.params.id + 'the data has been updated')
            }
        })
    },

    del_remove: (req, res) => {
        documentModel.deleteMany({ keyId: req.params.id }, (err, result) => {
            if (err) {
                res.send({ type: 'danger', message: 'Cannot remove the data' })
                console.log('An error has occurred: ' + err.message)
            }
            else {
                imageModel.deleteMany({ keyId: req.params.id }, (err, result) => {
                    if (err) {
                        console.log('An error has occurred: ' + err.message)
                    }
                })
                res.send({ type: 'success', message: 'The data has been removed' })
            }
        })
    },

    get_image: (req, res) => {
        imageModel.find({ keyId: req.params.id }, (err, result) => {
            res.json(result[0])
        })
    },

    get_stamp: (req, res) => {
        documentModel.find({ keyId: req.params.id }, (err, result) => {
            res.json(result[0])
        })
    },

    get_all: (req, res) => {
        documentModel.find({}, (err, result) => {
            res.json(result)
        })
    },

    post_export: async (req, res) => {
        await generateDoc(req, res)
    }
};
