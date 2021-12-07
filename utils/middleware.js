const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

// Extract authorization token from request
const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.substring(7)
  }
  next()
}

// Handle user identification by token and save user to request
const userExtractor = async (req, res, next) => {
  const token = req.token
  if(!token) {
    return res.status(401).json({
      error: 'invalid or missing token'
    })
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if(!decodedToken) {
    return res.status(401).json({ error: 'invalid authentication token' })
  }
  req.user = await User.findById(decodedToken.id)
  next()
}

// A severely underuser error-handler
const errorHandler = (err, req, res, next) => {
  logger.error(err.message)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  if (err.name === 'TypeError') {
    return res.status(400).json({ error: err.message })
  }
  next(err)
}

module.exports = { errorHandler, userExtractor, tokenExtractor }