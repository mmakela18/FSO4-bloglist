const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {type: String},
  pwhash: {type: String},
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.pwhash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User