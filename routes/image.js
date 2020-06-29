const { convert, convertOne } = require('./modules/convert')

module.exports = {
    convert: async (req, res) => {
        res.send(await convert(req, res))
    },
    convertOne: async (req, res) => {
        res.send(await convertOne(req, res))
    }
};
