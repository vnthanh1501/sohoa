const express = require('express')
const path = require('path')
const app = express()
const cookieParser = require('cookie-parser')
const routes = require('./config/routes')
require('./config/database')

app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.use(express.static(path.join(__dirname, 'public')))


routes(app)

app.listen(process.env.PORT || 3001)

