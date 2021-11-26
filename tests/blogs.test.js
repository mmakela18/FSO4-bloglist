const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const Blog = require('../models/blog')

const blogImport = require('./blogs')
const blogs = blogImport.blogs

beforeEach(async () => {
  await Blog.deleteMany({}).exec()
  blogs.forEach( async (blog) => {
    let newBlog = new Blog(blog)
    await newBlog.save()
  })
})

describe('testing GET for blogs', () => {
  //beforeEach(async () => {
    //await Blog.deleteMany({})
    //blogs.forEach( async (blog) => {
      //let newBlog = new Blog(blog)
      //await newBlog.save()
    //})
  //})
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
})

describe('testing POST for blogs', () => {
  //beforeEach(async () => {
    //await Blog.deleteMany({}).exec()
    //blogs.forEach( async (blog) => {
      //let newBlog = new Blog(blog)
      //await newBlog.save()
    //})
  //})
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
})
// Tests for users
describe('testing users', () => {
  beforeEach(async () => {
    // Init with one user for each test
    await User.deleteMany({}).exec()
    const testHash = await bcrypt.hash('lolleromato', 10)
    const testUser = new User({
      username: 'roflkopteri',
      pwhash: testHash
    })
    return await testUser.save()
  })
  test('can POST user', async () => {
    const newUser = {
      username: 'uusi',
      password: '1234'
    }
    const res = await api.post('/api/users').send(newUser)
    expect(res.status).toEqual(200)
    expect(res.headers['content-type']).toContain('application/json')
    console.log(res.body)
    expect(res.body.user).toBeDefined()
  })
  test('can GET users', async () => {
    await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('cant add duplicate username', async () => {
    const duplicate = {
      username: 'roflkopteri',
      password: '666'
    }
    await api.post('/api/users')
      .send(duplicate)
      .expect(400)
  })
  test('cant add a short username', async () => {
    const namelet = {
      username: ':(',
      password: 'nameletin raja on 3 merkkiä'
    }
    let res = await api.post('/api/users').send(namelet)
    expect(res.status).toEqual(400)
    expect(res.body.error).toContain('validation failed')
  })
  test('cant use a short or nonexistent password', async () => {
    const pwlet = {
      username: 'sufficient',
      password: 'pw'
    }
    await api.post('/api/users')
      .send(pwlet)
      .expect(400)
    const nopw = {
      username: 'nopw'
    }
    await api.post('/api/users')
      .send(nopw)
      .expect(400)
  })
})

afterAll( () => {
  mongoose.connection.close()
})