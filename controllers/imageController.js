const { convert, convertOne } = require('./modules/convert')

module.exports = {
    post_convert: async (req, res) => {
        res.send(await convert(req, res))
    },
    post_convertRegion: async (req, res) => {
        res.send(await convertOne(req, res))
    }
};
