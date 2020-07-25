
const cDocument = require('../controllers/documentController')
const cImage = require('../controllers/imageController')
const cUser = require('../controllers/userController')
const authorize = require('./middleware')

module.exports = (app) => {
    //Main page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'))
    });
    //User
    app.route('/api/register').post(authorize, cUser.post_create)
    app.route('/api/authenticate').post(cUser.authenticate)
    app.route('/api/checkToken').get(authorize, cUser.checkToken)
    app.route('/api/getInfo').get(authorize, cUser.get_info)
    app.route('/api/logout').get(cUser.logout)
    app.route('/api/users').get(authorize, cUser.get_all)
    app.route('/api/users/:id')
        .put(authorize, cUser.put_changePassword)
        .delete(authorize, cUser.delete_remove)
    //Document
    app.route('/api/documents')
        .get(cDocument.get_all)
        .post(authorize, cDocument.post_create)
    app.route('/api/documents/:id')
        .get(cDocument.get_image)
        .put(authorize, cDocument.put_edit)
        .delete(authorize, cDocument.delete_remove)
    app.route('/api/documents/:id').get(cDocument.get_stamp)
    app.route('/api/export').post(cDocument.post_export)
    //Image
    app.route('/api/convert').post(authorize, cImage.post_convert)
    app.route('/api/convertOne').post(authorize, cImage.post_convertRegion)
}