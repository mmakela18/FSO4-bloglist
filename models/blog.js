const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  url: String,
  likes: {type: Number, default: 0}
})
// turn mongodb _id field to id as fetching JSON
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
  }
})

module.exports = mongoose.model('Blog', blogSchema)
