const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

const blogImport = require('./blogs')
const blogs = blogImport.blogs

beforeEach(async () => {
  await Blog.deleteMany({})
  blogs.forEach( async (blog) => {
    let newBlog = new Blog(blog)
    await newBlog.save()
  })
})

test('blogs retrieved as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('id defined as "id"', async () => {
  // fetch all blog-entries
  const res = await api.get('/api/blogs')
  // take the first entry
  const entry = res.body[0]
  expect(entry.id).toBeDefined()
})

test('can POST a blog entry', async () => {
  // single new entry
  const toPost = {
    title: "Creation",
    author: "God",
    url: "everywhere",
    likes: 1,
    __v: 0
  }
  // POST
  postRes = await api.post('/api/blogs')
    .send(toPost)
    .expect(201)
  // see that length actually increased
  const res = await api.get('/api/blogs')
  expect(res.body).toHaveLength(blogs.length + 1)
  // see that the entry actually matches what was sent
  expect(res.body).toContainEqual(postRes.body)

})

test('likes defaults to 0', async () => {
  const toPost = {
    title: "Nobody likes me",
    author: "A. Hitler",
    url: "Berlin"
  }
  // POST
  const res = await api.post('/api/blogs').send(toPost).expect(201)
  expect(res.body.likes).toEqual(0)
})

test('cant POST without author or title', async () => {
  const toPost = {
    title: "I have no author"
  }
  await api.post('/api/blogs').send(toPost).expect(400)
})

afterAll( () => {
  mongoose.connection.close()
})