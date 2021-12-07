require('dotenv').config()

// Get the port which the server should listen to
const PORT = process.env.PORT

// Testing database should be separate from actual database
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  PORT,
  MONGODB_URI
}
