const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// Return all blog entries as json
blogsRouter.get('/', async(req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user',
      { username: 1 }
    )
    res.json(blogs)
  } catch(e) {
    next(e)
  }
})

// Handle an attempt to add a blog-entry
blogsRouter.post('/', async(req, res, next) => {
  // Middleware brought us user identification as a token
  const token = req.token
  if (!token) return res.status(401).json({ error: 'no token provided' })
  // Verify that the token translates into a valid user
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if(!decodedToken) {
    return res.status(401).json({ error: 'invalid authentication token' })
  }
  // Find the user and prepare the blog-entry
  // HOX: shouldn't this be in a try-catch too?
  const user = await User.findById(decodedToken.id)
  const postBlog = new Blog(req.body)
  // Intention: create new Blog that includes the user-id
  // How about some spread-notation eh?
  const withUser = new Blog({
    title: postBlog.title,
    author: postBlog.author,
    url: postBlog.url,
    user: user._id
  })
  try {
    // Try to save the blog-entry
    withUser.populate('user',
      { username: 1 }
    )
    const result = await withUser.save()
    // Update the user to include ownership of the new blog-entry
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

blogsRouter.put('/:id', async(req, res, next) => {
  try {
    const id = req.params.id
    // find user and blog, see if owner matches
    let blogToEdit = await Blog.findById(id)
    // User we get from middleware. See that authorization matches Blog ownership
    if (req.user._id.toString() === blogToEdit.user.toString()) {
      const newInfo = req.body
      // HOX: this is ugly, replace with spread syntax
      blogToEdit.title = newInfo.title
      blogToEdit.author = newInfo.author
      blogToEdit.likes = newInfo.likes
      blogToEdit.url = newInfo.url
      const savedBlog = await blogToEdit.save()
      return res.status(201).json(savedBlog)
    }
    return res.status(401).end()
  } catch (err) {
    next(err)
  }
})

blogsRouter.delete('/:id', async(req, res) => {
  const id = req.params.id
  try {
    const blogToDelete = await Blog.findById(id)
    // Find and get user whom blog belongs
    const potentialOwner = req.user
    if (potentialOwner.id.toString() === blogToDelete.user.toString()) {
      await blogToDelete.delete()
      return res.status(204).end()
    }
    res.status(401).end()
  } catch (err) {
    // probably not found
    return res.status(404).end()
  }
})

module.exports = blogsRouter
