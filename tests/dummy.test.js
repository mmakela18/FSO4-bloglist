const listHelper = require('../utils/list_helper')

describe('testing testing :D', () => {
  test('dummy returns one', () => {
    const blogs = []
  
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})
})