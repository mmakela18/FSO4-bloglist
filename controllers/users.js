const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')
const PW_MIN_LEN = 3

usersRouter.post('/', async (req, res, next) => {
  const body = req.body
  // Check pw before anyding
  try {
    if (body.password === null || body.password.length < PW_MIN_LEN) {
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
    const savedUser = await user.save()
    res.json(savedUser)
  } catch(err) { next(err) }
})

usersRouter.get('/', middleware.userExtractor, async (req, res) => {
  const users = await User.find({})
  res.json(users.map(user => user.toJSON()))
})
module.exports = usersRouter