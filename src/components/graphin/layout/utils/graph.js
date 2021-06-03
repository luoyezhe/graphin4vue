export const getDegree = (node, edges) => {
  const nodeId = node.data.id
  let index = 0
  edges.forEach(edge => {
    if (edge.data.source === nodeId || edge.data.target === nodeId) {
      index = index + 1
    }
  })
  return index
}
