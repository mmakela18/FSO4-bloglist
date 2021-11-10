require('dotenv').config({path: '.env'})

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
console.log(process.env.PASKAA)
console.log("tuolla: ", MONGODB_URI)
console.log("port: ", PORT)
module.exports = {
  PORT,
  MONGODB_URI
}
