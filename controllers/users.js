const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

const PW_MIN_LEN = 3

usersRouter.post('/users', async (req, res, next) => {
  const body = req.body
  // Check pw before anyding
  if (body.password == null || body.password.length < PW_MIN_LEN) {
    res.status(400).json( {
      error: 'password too short or missing'
    })
  }
  const saltrounds = 10
  const pwhash = await bcrypt.hash(body.password, saltrounds)
  const user = new User({
    username: body.username,
    pwhash: pwhash
  })
  try {
    const savedUser = await user.save()
    res.json(savedUser)
  } catch (err) { next(err) }
})

usersRouter.get('/users', async (req, res) => {
  const users = await User.find({})
  res.json(users.map(user => user.toJSON()))
})
module.exports = usersRouter