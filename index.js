const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs.js')

app.use('/api', blogsRouter)

mongoose.connect(config.MONGODB_URI)
logger.info("connected to mongodb")
app.use(cors())
app.use(express.json())


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
