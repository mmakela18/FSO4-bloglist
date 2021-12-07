const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')
// Minimum password length
// Hardcoded here, because it has to be handled here, not in mongoose
// HOX: Could still export to a config with other requirements?
const PW_MIN_LEN = 3

// Handle addition of a new user
usersRouter.post('/', async (req, res, next) => {
  const body = req.body
  // Check password requirements before anyding else
  try {
    if (body.password === null || body.password.length < PW_MIN_LEN) {
      res.status(400).json( {
        error: 'password too short or missing'
      })
    }
    // Ugly hardcoded salt. Recommended rounds.
    const saltrounds = 10
    const pwhash = await bcrypt.hash(body.password, saltrounds)
    // The real user object we want to save
    const user = new User({
      username: body.username,
      pwhash: pwhash
    })
    const savedUser = await user.save()
    res.json(savedUser)
  } catch(err) { next(err) }
})

// Return all users. Why? Also what about error handling?
usersRouter.get('/', middleware.userExtractor, async (req, res) => {
  const users = await User.find({})
  res.json(users.map(user => user.toJSON()))
})
module.exports = usersRouter