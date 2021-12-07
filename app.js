const config = require('./utils/config')
const logger = require('./utils/logger')
const cors = require('cors')
require('express-async-errors')
const mongoose = require('mongoose')
const express = require('express')
const blogsRouter = require('./controllers/blogs.js')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const morgan = require('morgan') // Logging
const app = express()

mongoose.connect(config.MONGODB_URI)
logger.info('connected to mongodb')
app.use(cors())
app.use(express.json())
// Enable logging if not running tests
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('common'))
}
app.use('/api/blogs',  middleware.tokenExtractor, middleware.userExtractor, blogsRouter)
app.use('/api/users', middleware.tokenExtractor, usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.errorHandler)

module.exports = app
