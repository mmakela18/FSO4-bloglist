const config = require('./utils/config')
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const blogsRouter = require('./controllers/blogs.js')
const logger = require('./utils/logger')
const app = express()

mongoose.connect(config.MONGODB_URI)
logger.info('connected to mongodb')
app.use(cors())
app.use(express.json())

app.use('/api', blogsRouter)

module.exports = app
