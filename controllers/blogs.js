const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/blogs', async(req, res, next) => {
  // fetch all entries
  try {
    const blogs = await Blog.find({})
    res.json(blogs)
  } catch(e) {
    next(e)
  }
})

blogsRouter.post('/blogs', async(req, res, next) => {
  const postBlog = new Blog(req.body)
  try {
    const result = await postBlog.save()
    res.status(201).json(result)
  } catch(e) {
    res.status(400).end()
    next(e)
  }
})

module.exports = blogsRouter
