const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const Blog = require('../models/blog')

const blogImport = require('./blogs')
const blogs = blogImport.blogs

/*
New test-suite:
  no-login-tests:
    beforeEach:
      clear blogs
      repopulate blogs
    
  
*/

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
  // variable to save authentication token from first test (login)
  let token = ''
  // POST requires authentication: create test user before tests
  beforeAll(async () => {
    await User.deleteMany({}).exec()
    const testhash = await bcrypt.hash('lolleromato', 10)
    const testUser = new User({
      username: 'roflkopteri',
      pwhash: testhash
    })
    await testUser.save()
  })
  test('can login and get token', async() => {
    const loginUser = {
      username: 'roflkopteri',
      password: 'lolleromato'
    }
    const res = await api.post('/api/login')
      .send(loginUser)
      .expect(200)
    expect(res.body.token).toBeDefined()
    // still gotta add the "bearer" part
    token = `bearer ${res.body.token}`
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
    const postRes = await api.post('/api/blogs')
      .send(toPost)
      .set('Authorization', token)
      .expect(201)
    // see that length actually increased
    const res = await api.get('/api/blogs')
    expect(res.body).toHaveLength(blogs.length + 1)
    // see that the entry actually matches what was sent
    expect(postRes.body.author).toEqual(toPost.author)
    expect(postRes.body.title).toEqual(toPost.title)

  })

  test('likes defaults to 0', async () => {
    const toPost = {
      title: "Nobody likes me",
      author: "A. Hitler",
      url: "Berlin"
    }
    // POST
    const res = await api.post('/api/blogs')
      .send(toPost)
      .set('Authorization', token)
      .expect(201)
    expect(res.body.likes).toEqual(0)
  })

  test('cant POST without author or title', async () => {
    const toPost = {
      title: "I have no author"
    }
    await api.post('/api/blogs')
      .send(toPost)
      .set('Authorization', token)
      .expect(400)
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

describe('testing DELETE', () => {
  // variables for login token and post ID
  let token = ''
  let postId = ''
  // Need to create user and post a blog to test
  beforeEach( async() => {
    // Initialize user
    await User.deleteMany({})
    const testHash = await bcrypt.hash('lolleromato', 10)
    const testUser = new User({
      username: 'roflkopteri',
      pwhash: testHash
    })
    await testUser.save()
    // Login and save token
    const loginUser = {
      username: 'roflkopteri',
      password: 'lolleromato'
    }
    const postRes = await api.post('/api/login').send(loginUser)
    token = `bearer ${postRes.body.token}`
    // Make a blog
    const testPost = {
      title: 'testi',
      author: 'testi'
    }
    const res = await api.post('/api/blogs')
      .send(testPost)
      .set('Authorization', token)
    //console.log(res)
    postId = res.body.id
  })
  test('cannot delete a post without authorization', async() => {
    await api.delete(`/api/blogs/${postId}`)
      .expect(401)
  })
  test('can delete a blog with proper authorization', async() => {
    await api.delete(`/api/blogs/${postId}`)
      .set('Authorization', token)
      .expect(204)
  })
})

afterAll( () => {
  mongoose.connection.close()
})