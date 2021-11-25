const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
  const body = req.body
  const saltrounds = 10
  const pwhash = await bcrypt.hash(body.password, saltrounds)

  const user = new User({
    username: body.username,
    pwhash: pwhash
  })
  const savedUser = await user.save()

  res.json(savedUser)
})

module.exports = usersRouter