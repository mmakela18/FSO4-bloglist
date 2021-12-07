const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// Define how a User is to be saved in the database
const userSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true, minLength: 3 },
  pwhash: { type: String, required: true },
  // Each user should have their blog-entries listed as well
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

// Ensure that hashed password in not returned.
// Also turn _id(Object) into id(String) and remove for now useless __v
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.pwhash
  }
})

// Need to enable validator for required unique fields in userSchema
userSchema.plugin(uniqueValidator)
const User = mongoose.model('User', userSchema)

module.exports = User