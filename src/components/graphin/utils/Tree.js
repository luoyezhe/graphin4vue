export default class Tree {
  constructor (root) {
    this.nodeIds = []
    this.bfs = (cb) => {
      if (!this.root) {
        return
      }
      const queue = []
      queue.push(this.root)
      while (queue.length) {
        const node = queue.shift()
        if (cb(node)) {
          return node
        }
        if (node?.children?.length) {
          queue.push(...node.children)
        }
      }
    }
    this.getRoot = () => {
      return this.root
    }
    this.getNode = (id) => {
      const result = this.bfs(node => {
        return node.id === id
      })
      return result
    }
    // eslint-disable-next-line
    this.addRoot = (id, data) => {
      this.root = {
        id,
        children: []
      }
      this.nodeIds.push(id)
    }
    // eslint-disable-next-line
    this.addNode = (conf) => {
      const {
        parentId,
        id,
        data
      } = conf
      if (!this.root) {
        this.addRoot(id, data)
        return
      }
      let parent
      if (!parentId) {
        // If parentId was not given, pick a random node as parent
        const index = Math.floor(Math.random() * this.nodeIds.length)
        parent = this.getNode(this.nodeIds[index])
      } else {
        parent = this.getNode(parentId)
      }
      if (!parent) {
        console.error("Parent node doesn't exist!")
        return
      }
      this.nodeIds.push(id)
      parent.children.push({
        id,
        parent,
        children: []
      })
    }
    // Pass in the root of an existing tree
    if (root) {
      this.root = root
    }
  }
}
