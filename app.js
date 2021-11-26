const config = require('./utils/config')
const cors = require('cors')
require('express-async-errors')
const mongoose = require('mongoose')
const express = require('express')
const blogsRouter = require('./controllers/blogs.js')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const app = express()

mongoose.connect(config.MONGODB_URI)
logger.info('connected to mongodb')
app.use(cors())
app.use(express.json())

app.use('/api', blogsRouter)
app.use('/api', usersRouter)
app.use('/api', loginRouter)
app.use(middleware.errorHandler)

module.exports = app
