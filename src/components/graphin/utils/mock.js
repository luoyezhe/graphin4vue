import Tree from './Tree'
import walk from './walk'

const defaultOptions = {
  /** 节点 */
  nodeCount: 10,
  nodeType: 'company'
}

/**
 * 1,mock data with edges,nodes
 * 2.mock nodes properties
 * 3.filter edges
 * 4.
 */
export class Mock {
  constructor (count) {
    this.initNodes = () => {
      const {
        nodeCount,
        nodeType
      } = this.options
      const temp = Array.from({ length: nodeCount })
      this.nodes = temp.map((node, index) => {
        return {
          id: `node-${index}`,
          label: `node-${index}`,
          type: nodeType
        }
      })
      for (let i = 0; i < nodeCount; i = i + 1) {
        for (let j = 0; j < nodeCount - 1; j = j + 1) {
          this.edges.push({
            source: `node-${i}`,
            target: `node-${j}`
          })
        }
      }
      this.nodeIds = this.nodes.map(node => node.id)
    }
    this.expand = (snodes) => {
      this.edges = []
      this.nodes = []
      snodes.forEach(node => {
        for (let i = 0; i < this.options.nodeCount; i += 1) {
          this.nodes.push({
            id: `${node.id}-${i}`,
            type: node.type
          })
          this.edges.push({
            source: `${node.id}-${i}`,
            target: node.id
          })
        }
      })
      return this
    }
    this.type = (nodeType) => {
      this.nodes = this.nodes.map(node => {
        return {
          ...node,
          type: nodeType
        }
      })
      return this
    }
    this.circle = (centerId = '') => {
      let id = centerId
      if (this.nodeIds.indexOf(id) === -1) {
        id = 'node-0'
      }
      this.edges = this.edges.filter((edge) => {
        return edge.source === id || edge.target === id
      })
      return this
    }
    /**
     * @param ratio 随机的稀疏程度，默认0.5
     */
    this.random = (ratio = 0.5) => {
      const { nodeCount } = this.options
      const length = parseInt(String(nodeCount * ratio))
      /**  随机ID */
      const randomArray = this.nodeIds.sort(() => Math.random() - 0.5).slice(0, length)
      this.edges = this.edges.filter((edge) => {
        return randomArray.indexOf(edge.target) !== -1
      })
      this.edges = this.edges.sort(() => Math.random() - 0.5).slice(0, length)
      return this
    }
    this.tree = () => {
      this.edges = []
      this.treeData = new Tree()
      const rootId = this.nodeIds[0]
      this.nodeIds.forEach(id => {
        this.treeData.addNode({
          id,
          style: {
            label: {
              value: id
            }
          }
        })
      })
      this.treeData.bfs(node => {
        if (node.id !== rootId) {
          this.edges.push({
            source: node?.parent?.id,
            target: node.id,
            properties: []
          })
        }
        return false
      })
      return this
    }
    this.value = () => {
      return {
        nodes: this.nodes,
        edges: this.edges
      }
    }
    this.combos = (chunkSize) => {
      const comboIds = new Set()
      this.nodes = this.nodes.map((node, index) => {
        const comboIndex = Math.ceil((index + 1) / chunkSize)
        const comboId = `combo-${comboIndex}`
        comboIds.add(comboId)
        return {
          ...node,
          comboId
        }
      })
      this.combosData = [...comboIds].map(c => {
        return {
          id: c,
          label: c
        }
      })
      return this
    }
    this.graphin = () => {
      return {
        nodes: this.nodes.map(node => {
          return {
            ...node,
            id: node.id,
            type: 'graphin-circle',
            comboId: node.comboId,
            style: {
              label: {
                value: `${node.id}`
              }
            }
          }
        }),
        edges: this.edges.map(edge => {
          return {
            source: edge.source,
            target: edge.target
          }
        }),
        combos: this.combosData
      }
    }
    this.graphinTree = () => {
      const tree = this.treeData.getRoot()
      walk(tree, node => {
        delete node.parent
      })
      return tree
    }
    this.options = defaultOptions
    this.options.nodeCount = count
    this.nodes = []
    this.edges = []
    this.nodeIds = []
    this.treeData = new Tree()
    this.initNodes()
  }
}

const mock = (count) => {
  return new Mock(count)
}
export default mock
