
const listHelper = require('../utils/list_helper')
const blogsImport = require('./blogs')
const blogs = blogsImport.blogs
console.log(blogs)

describe('testing testing :D', () => {
  test('dummy returns one', () => {
    const blogs = []
    console.log('TÄÄL: ', listHelper)
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
  })
})

describe('list_helper.js: fun totalLikes:', () => {
  // Begin tests
  test('return correct sum for the whole array:', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
  test('return zero for empty array:', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })
  test('return correct likes for an array of one blog:', () => {
    const index = Math.floor(Math.random() * blogs.length)
    let singleArray = []
    singleArray = singleArray.concat(blogs[index])
    const result = listHelper.totalLikes(singleArray)
    expect(result).toBe(singleArray[0].likes)
  })
})

describe('function favoriteBlog in list_helper.js', () => {
  //Begin tests
  test('return the one with most likes', () => {
    // Hardcoded to be the third
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(blogs[2])
  })
  test('return zero for empty array', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toBe(0)
  })
})