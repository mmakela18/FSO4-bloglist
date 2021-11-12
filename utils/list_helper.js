const dummy = (blogs) => {
  return 1
}

// Return number of likes from an array of blog-objects
const totalLikes = (blogs) => {
  // Check special cases
  if (blogs.length === 0) return 0
  if (blogs.length === 1) return blogs[0].likes
  // Reducer must return object with the wanted field
  const reducer = (prev, curr) => {
    return {
      likes: prev.likes + curr.likes
    }
  }
  // Only return likes from this reduced object
  return blogs.reduce(reducer).likes
}

// Return the blog with the most likes from array of blog-objects
const favoriteBlog = (blogs) => {
  // Check special cases
  if (blogs.length === 0) return 0
  if (blogs.length === 1) return blogs[0]
  // Reducer: return one with more likes
  const reducer = (prev, curr) => {
    /* This works ofc
    if (prev.likes < curr.likes) {
      return curr
    }
    return prev
    */
    // Even this still works
    return(prev.likes < curr.likes
      ? curr
      : prev)
    /* but THIS doesn't doesn't return an object
    prev.likes < curr.likes
    ? curr
    : prev
    */
  }
  return blogs.reduce(reducer)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}