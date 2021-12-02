const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const Blog = require('../models/blog')

const blogImport = require('./blogs')
const blogs = blogImport.blogs

// define paths for routes
const BLOGS = '/api/blogs'
const USERS = '/api/users'
const LOGIN = '/api/login'

/*
  Rethink tests:
    doesn't require authentication:
      POST users
        -can register valid user
          (clear users-database)
        -can't register invalid user
          (clear users-database)
      POST login
        -can login with right authentication
        -can't login without right authentication
        -can't login without authentication
    requires authentication:
        (clear users and register a user)
      GET users
        -can't GET without right authentication
          (populate users)
        -can't GET without authentication
          (populate users)
        -can GET with good authentication
          (populate users)
      GET blogs
        -can't GET without correct authentication
          (populate blogs)
        -can't GET without authentication
          (populate blogs)
        -can GET with correct authentication
          (populate blogs)
      POST blogs
        -can't POST without authentication
      DELETE blogs

  So really tests should be divided to:
  beforeAll(clear and populate both users and blogs)
    describe(testing WITHOUT authentication)
      test(cannot register an invalid user)
      test(cannot GET users)
      test(cannot GET blogs)
      test(cannot POST blogs)
      test(cannot DELETE blogs)
      test(can POST a valid user)
      test(cannot POST login without valid credentials)
      test(cannot POST login with missing credentials)
        ### EXIT IF FAIL ###
      describe(testing WITH authentication, no change to db)
        test(can POST login)
        test(can GET users)
        test(can GET blogs)
        describe(testing WITH authentication, changes to db)
          test(can POST blogs)
          test(can DELETE blogs)
*/

// dummy to populate users with
const dummyUser = {
  username: 'dummy',
  pwhash: 'dummy'
}
// user to use in testing
const testUser = {
  username: 'testing',
  password: 'testing'
}
let testUserId = ''
// init login-token for testUser
let testToken = ''
beforeAll(async () => {
  // clear users and blogs
  await User.deleteMany({}).exec()
  await Blog.deleteMany({}).exec()
  // populate blogs
  blogs.forEach(async (blog) => {
    await new Blog(blog).save()
  })
  // populate users
  await new User(dummyUser).save()
  // give the testhash value
})

describe('tests without authentication', () => {
  // expecting same results from multiple tests
  const deniedWithError401 = (res) => {
    expect(res.status).toEqual(401)
    expect(res.type).toEqual('application/json')
    // not expecting a specific error msg, since that may change
    expect(res.body.error).toBeDefined()
  }
  // GET users should fail and return an error message
  test('cannot GET users', async () => {
    const res = await api.get(USERS)
    deniedWithError401(res)
  })
  // GET blogs should fail as above
  test('cannot GET blogs', async () => {
    const res = await api.get(BLOGS)
    deniedWithError401(res)
  })
  // as should POST
  test('cannot POST blogs', async () => {
    const blogToPost = {
      author: 'some dummy',
      title: 'posting blogs for dummies'
    }
    const res = await api.get(BLOGS).send(blogToPost)
    deniedWithError401(res)
  })
  test('cannot DELETE blogs', async () => {
    // get a blog for id
    const blogToDelete = Blog.findOne({})
    deniedWithError401(await api.delete(BLOGS).send(blogToDelete.id))
  })
})
// test posting users
describe('testing POST users', () => {
  const deniedWithError400 = (res) => {
    expect(res.status).toEqual(400)
    // just ensure there is some error msg sent in json
    expect(res.type).toEqual('application/json')
    expect(res.body.error).toBeDefined()
  }
  test('cannot POST a duplicate username', async () => {
    // db should already be initialized with dummyUser
    const duplicate = {
      username: dummyUser.username,
      password: 'irrelevant'
    }
    const res = await api.post(USERS).send(duplicate)
    deniedWithError400(res)
  })
  // shortest allowed password/username should be 3
  test('cannot POST a short username or password', async () => {
    let shortie = {
      username: ':(', // sorry, not everyone is born equal
      password: 'long enough'
    }
    deniedWithError400(await api.post(USERS).send(shortie))
    // swap fields and retry
    shortie.username = 'long enough'
    shortie.password = ':(' // don't be sad, you'll be in garbage disposal soon
    deniedWithError400(await api.post(USERS).send(shortie))
  })
  // fields username and password should be required
  test('cannot POST with missing username or password', async () => {
    const nameless = {
      password: 'irrelevant'
    }
    deniedWithError400(await api.post(USERS).send(nameless))
    const passwordless = {
      username: 'irrelevant'
    }
    deniedWithError400(await api.post(USERS).send(passwordless))
  })
  test('can POST with valid user', async () => {
    // make sure and measure count also
    const countB4 = await User.count({}).exec()
    const res = await api.post(USERS).send(testUser)
    expect(res.status).toEqual(200)
    expect(res.type).toEqual('application/json')
    expect(res.body.username).toEqual(testUser.username)
    expect(res.body.id).toBeDefined()
    testUserId = res.body.id
    const countAfter = await User.count({}).exec()
    expect(countAfter).toEqual(countB4 + 1)
  })
})
/* HOX: at this point it is assumed that the previous test succeeded. Otherwise there is no point
  to proceed. There's no skipping functionality yet, so please run with 'bail:1' in your jest config */
describe('testing POST login', () => {
  const deniedWithError401 = (res) => {
    // copy from earlier, but this may get more login specific later
    expect(res.status).toEqual(401)
    expect(res.type).toEqual('application/json')
    expect(res.body.error).toBeDefined()
  }
  beforeAll( async () => {
    // generate hash for testUser
  })
  test('can login with valid credentials', async () => {
    const res = await api.post(LOGIN).send(testUser)
    expect(res.status).toEqual(200)
    expect(res.type).toEqual('application/json')
    expect(res.body.username).toEqual(testUser.username)
    expect(res.body.token).toBeDefined()
    // save token for future tests
    testToken = `bearer ${res.body.token}`
  })
  test('cannot login without credentials', async () => {
    const notValid = {
      username: 'notValid',
      password: 'notValid'
    }
    deniedWithError401(await api.post(LOGIN).send(notValid))
  })
  test('cannot login with false credentials', async () => {
    const falseUser = {
      username: testUser.username,
      password: 'brute force'
    }
    const res = await api.post(LOGIN).send(falseUser)
    deniedWithError401(res)
    expect(res.body.token).not.toBeDefined()
  })
})

describe('testing with authorization, no db change', () => {
  const acceptedWith200 = (res) => {
    expect(res.status).toEqual(200)
    expect(res.type).toEqual('application/json')
  }
  test('can GET blogs', async () => {
    const res = await api.get(BLOGS)
      .set('Authorization', testToken)
    acceptedWith200(res)
  })
  test('can GET users', async () => {
    const res = await api.get(USERS)
      .set('Authorization', testToken)
    acceptedWith200(res)
  })
})

describe('testing with authorization, changes to db', () => {
  // variable to save blog id if POST successfull
  let testPostId = ''
  // testpost for PUT and POST
  const testPost = {
    author: 'GOD',
    title: 'HOW TO BEAT SATAN'
  }
  const succeededWith201 = (res) => {
    expect(res.status).toEqual(201)
    expect(res.type).toEqual('application/json')
  }
  test('can POST blog', async () => {
    // blog-db already initialized, get initial length
    const countB4 = await Blog.count()
    const res = await api.post(BLOGS)
      .send(testPost)
      .set('Authorization', testToken)
    succeededWith201(res)
    // but did it grow?
    const countAfter = await Blog.count()
    expect(countAfter).toEqual(countB4 + 1)
    // all info intact?
    expect(res.body.author).toEqual(testPost.author)
    expect(res.body.title).toEqual(testPost.title)
    // did likes default to zero?
    expect(res.body.likes).toEqual(0)
    // there should also be a user-field that matches the testUser
    const userFromBlog = await User.findById(res.body.user)
    expect(userFromBlog.username).toEqual(testUser.username)
    // AND was this blog added to the testUsers blogs[] field?
    const blogIdFromResponse = res.body.id.toString()
    // probably not the right way, but it works for now
    expect(userFromBlog.blogs.toString()).toContain(blogIdFromResponse)
    // save id for next test
    testPostId = res.body.id
  })
  test('can PUT blog', async () => {
    // fetch testpost from previous test 
    console.log(testPostId)
    // should be able to change all fields with id remaining the same
    const postedTestPost = {
      ...testPost,
      author: 'changed',
      title: 'changed',
      likes: 666,
      url: 'http://localhost:3003/'
    }
    const res = await api.put(`${BLOGS}/${testPostId}`)
      .set('Authorization', testToken)
      .send(postedTestPost)
    succeededWith201(res)
    // check contents were changed
    expect(res.body.author).toEqual(postedTestPost.author)
    expect(res.body.title).toEqual(postedTestPost.title)
    expect(res.body.likes).toEqual(postedTestPost.likes)
    console.log(res.body)
    expect(res.body.url).toEqual(postedTestPost.url)
    // id and user should have remained the same
    expect(res.body.id).toEqual(testPostId)
    expect(res.body.user).toEqual(testUserId)
  })
  test('can DELETE blog', async () => {
    const res = await api.delete(`${BLOGS}/${testPostId}`)
      .set('Authorization', testToken)
    expect(res.status).toEqual(204)
  })
  test('gib 404 when authorized DELETE to nonexistant id', async () => {
    const res = await api.delete(`${BLOGS}/idontexist`)
      .set('Authorization', testToken)
    expect(res.status).toEqual(404)
  })
}) 

afterAll( () => {
  mongoose.connection.close()
})