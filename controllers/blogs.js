const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user') 
const jwt = require('jsonwebtoken')

const getTokenFrom = req => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.substring(7)
  }
  return null
}


blogsRouter.get('/blogs', async(req, res, next) => {
  // fetch all entries
  try {
    const blogs = await Blog.find({}).populate('user',
      { username: 1 }
    )
    res.json(blogs)
  } catch(e) {
    next(e)
  }
})

blogsRouter.post('/blogs', async(req, res, next) => {
  const token = getTokenFrom(req)
  if (!token) return res.status(401).json({error: 'no token provided'})
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if(!decodedToken) {
    return res.status(401).json({ error: 'invalid authentication token' })
  }
  const postBlog = new Blog(req.body)
  // for now: just place the first user in db as author
  const user = await User.findById(decodedToken.id)
  const withUser = new Blog({
    title: postBlog.title,
    author: postBlog.author,
    user: user._id 
  })
  try {
    const result = await withUser.save()
    // i guess we made it?
    user.blogs = user.blogs.concat(result._id)
    await user.save({
      // Validator will cry about "duplicate _id" without this option
      validateModifiedOnly: true
    })
    res.status(201).json(result)
  } catch(e) {
    res.status(400).end()
    next(e)
  }
})

blogsRouter.delete('/blogs/:id', async(req, res) => {
  await Blog.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

module.exports = blogsRouter
