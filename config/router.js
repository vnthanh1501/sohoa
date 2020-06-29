
const cDocument = require('../routes/document')
const cImage = require('../routes/image')
const cUser = require('../routes/user')
const authorize = require('../config/middleware')

module.exports = (app) => {
    //Main page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'))
    });

    //Register and authenticate
    app.route('/api/register')
        .post(authorize, cUser.register)
    app.route('/api/authenticate')
        .post(cUser.authenticate)

    app.route('/api/checkToken')
        .get(authorize, cUser.checkToken)
    app.route('/api/getInfo')
        .get(authorize, cUser.getInfo)
    app.route('/api/logout')
        .get(cUser.logout)
    app.route('/api/users')
        .get(authorize, cUser.getAll)
    app.route('/api/users/:id')
        .put(authorize, cUser.update)
        .delete(authorize, cUser.delete)

    //Function
    app.route('/api/documents')
        .get(cDocument.getAll)
        .post(authorize, cDocument.create)
    app.route('/api/documents/:id')
        .get(cDocument.getImage)
        .put(authorize, cDocument.update)
        .delete(authorize, cDocument.delete)
    app.route('/api/stamps/:id')
        .get(cDocument.getStamp)
    app.route('/api/export')
        .post(cDocument.export)

    app.route('/api/convert')
        .post(authorize, cImage.convert)
    app.route('/api/convertOne')
        .post(authorize, cImage.convertOne)
}