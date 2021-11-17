const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})
// turn mongodb _id field to id as fetching JSON
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
  }
})
module.exports = mongoose.model('Blog', blogSchema)
