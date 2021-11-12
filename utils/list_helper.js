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

module.exports = {
  dummy,
  totalLikes
}