const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

// Straight copy from the material
loginRouter.post('/', async (req, res) => {
  const body = req.body
  // First, get the User
  const user = await User.findOne( { username: body.username })
  // If User was found, see that password matches
  const pwCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.pwhash)
  if (!(user && pwCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }
  // Another object to validate User.
  // HOX: there must be a better way to do this
  const userForToken = {
    username: user.username,
    id: user._id
  }
  // Generate and send login-token for user
  const token = jwt.sign(userForToken, process.env.SECRET)
  res.status(200).send({
    token,
    username: user.username
  })

})

module.exports = loginRouter