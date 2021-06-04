import { deepMix } from '@antv/util'

function isEven (number) {
  return number % 2 === 0
}

function isOdd (number) {
  return !isEven(number)
}

/**
 *
 * @param edges 边的集合
 * @param {poly,loop} 设置多边和自环多边的distance
 */
const processEdges = (edges, {
  poly = 50,
  loop = 10
} = {
  poly: 50,
  loop: 10
}) => {
  const edgesMap = {}
  edges.forEach(edge => {
    const {
      source,
      target
    } = edge
    const edgeId = `${source}-${target}`
    const revertEdgeId = `${target}-${source}`
    /** 存储edge */
    if (edgesMap[edgeId]) {
      edgesMap[edgeId].push(edge)
    } else if (edgesMap[revertEdgeId]) {
      edge.revert = true
      edgesMap[revertEdgeId].push(edge)
    } else {
      edgesMap[edgeId] = [edge]
    }
  })
  const edgeGroups = Object.values(edgesMap)
  const newEdges = []
  edgeGroups.forEach(edges => {
    if (edges.length > 1) {
      // 说明是多边的情况
      const isEvenCount = isEven(edges.length)
      edges.forEach((edge, i) => {
        const {
          source,
          target
        } = edge
        const isLoop = source === target
        const index = i // edge.revert ? i + 1 : i;
        let distance
        if (isEvenCount) {
          // 奇数
          const idx = Math.ceil(index / 2)
          distance = poly * idx
        } else {
          // 偶数
          const calculateIdx = isOdd(index) ? index + 1 : index
          const idx = Math.ceil(calculateIdx / 2)
          distance = poly * idx
        }
        let resultDistance = isEven(index) ? distance : -distance
        // 反向边需要revert
        if (edge.revert) {
          resultDistance = -resultDistance
          delete edge.revert
        }
        let keyshapeStyle = {
          type: 'poly',
          poly: {
            distance: resultDistance
          }
        }
        if (isLoop) {
          keyshapeStyle = {
            type: 'loop',
            loop: {
              distance: index * loop
            }
          }
        }
        deepMix(edge, {
          style: {
            keyshape: keyshapeStyle
          }
        })
        newEdges.push(edge)
      })
    } else {
      newEdges.push(edges[0])
    }
  })
  return newEdges
}
export default processEdges
