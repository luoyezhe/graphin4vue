import { useContext } from '../Provide'
import G6 from '@antv/g6'
import state from './state/state'

// 排列组合
const combine = function (arr, k) {
  const ret = []
  const n = arr.length
  const helper = (start, prev) => {
    const len = prev.length
    if (len === k) {
      ret.push(prev)
      return
    }
    // 还有 rest 个位置待填补
    const rest = k - prev.length
    for (let i = start; i < n; i++) {
      if (n - i + 1 < rest) {
        continue
      }
      helper(i + 1, prev.concat(arr[i]))
    }
  }
  helper(0, [])
  return ret
}

const Links = {
  setup () {
    const { graph } = useContext()
    const getNeighbors = () => {
      const selectedNodes = graph.findAllByState('node', 'selected')
      const singe = selectedNodes.length === 1
      if (singe) {
        const NeighborNodes = []
        const neighborsEdges = []
        selectedNodes.forEach((node) => {
          const neighbors = node.getNeighbors()
          const edges = node.getEdges()
          NeighborNodes.push(...neighbors)
          neighborsEdges.push(...edges)
        })
        NeighborNodes.forEach((node) => {
          graph.setItemState(node, 'selected', true)
        })
        neighborsEdges.forEach((edge) => {
          graph.setItemState(edge, 'selected', true)
        })
        return
      }
      const { findShortestPath } = G6.Algorithm
      // path 为其中一条最短路径，allPath 为所有的最短路径
      const pathNodeMap = {}

      const data = graph.save()
      const linkNodes = combine(selectedNodes, 2)

      function getAllShortestLink (nodeArr) {
        const { path } = findShortestPath(
          data,
          nodeArr[0].getID(),
          nodeArr[1].getID()
        )
        if (!path) return
        path.forEach((id) => {
          const pathNode = graph.findById(id)
          pathNode.toFront()
          graph.setItemState(pathNode, 'selected', true)
          pathNodeMap[id] = true
        })
        graph.getEdges().forEach((edge) => {
          const edgeModel = edge.getModel()
          const source = edgeModel.source
          const target = edgeModel.target
          const sourceInPathIdx = path.indexOf(source)
          const targetInPathIdx = path.indexOf(target)
          if (sourceInPathIdx === -1 || targetInPathIdx === -1) return
          if (Math.abs(sourceInPathIdx - targetInPathIdx) === 1) {
            graph.setItemState(edge, 'selected', true)
          } else {
            graph.setItemState(edge, 'inactive', true)
          }
          edge.toFront()
        })
      }

      linkNodes.forEach((item) => {
        getAllShortestLink(item)
      })

      graph.getNodes().forEach((node) => {
        if (!pathNodeMap[node.getID()]) {
          graph.setItemState(node, 'inactive', true)
        }
      })
    }
    return () => {
      const context = arguments[1]
      let children = context.slots.default
      children = children ? children() : '关系'
      return <div onClick={getNeighbors}>{children}</div>
    }
  }
}

const PaternityMap = {
  source: '父级',
  target: '子级'
}

const Paternity = (type) => {
  return {
    setup () {
      const { graph } = useContext()
      const getObserve = (type) => {
        const items = graph.findAllByState('node', 'selected')
        const {
          setAllItemStates,
          pushSetStack
        } = state
        const instance = {
          graph: graph,
          resetSelected: true
        }
        setAllItemStates.call(instance, items, type)
        pushSetStack.call(instance, items, type)
      }
      return () => {
        const context = arguments[1]
        let children = context.slots.default
        children = children ? children() : PaternityMap[type]
        return <div onClick={() => {
          getObserve(type)
        }}>{children}</div>
      }
    }
  }
}

const Source = Paternity('target')
const Target = Paternity('source')

export {
  Links,
  Source,
  Target
}
