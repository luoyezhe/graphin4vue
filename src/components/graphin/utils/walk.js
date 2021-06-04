const walk = (node, callback) => {
  callback(node)
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      walk(child, callback)
    })
  }
}
export default walk
