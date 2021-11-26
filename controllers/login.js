const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/login', async (req, res) => {
  const body = req.body

  const user = await User.findOne( { username: body.username })
  console.log(user.pwhash)
  console.log(body.password)
  const pwCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.pwhash)

  if (!(user && pwCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  res.status(200).send({
    token,
    username: user.username
  })

})

module.exports = loginRouter