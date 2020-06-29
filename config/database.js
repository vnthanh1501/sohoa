
const mgs = require('mongoose')

//Cloud - mongoDB
// mgs.connect('mongodb://thanhvu:matkhau@ddocument-shard-00-00-8c7xy.gcp.mongodb.net:27017,ddocument-shard-00-01-8c7xy.gcp.mongodb.net:27017,ddocument-shard-00-02-8c7xy.gcp.mongodb.net:27017/test?ssl=true&replicaSet=DDocument-shard-0&authSource=admin&retryWrites=true&w=majority', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })


// //Local - mongoDB
mgs.connect('mongodb://localhost:27017/', {
    useCreateIndex: true, useNewUrlParser: true,
    useUnifiedTopology: true
})