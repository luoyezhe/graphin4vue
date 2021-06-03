import { useContext } from '@graphin'
import LegendNode from './Node'
import { onUpdated } from 'vue'

const getEnumValue = (keyString, data) => {
  const keyArray = keyString.split('.')
  const enumValue = keyArray.reduce((acc, curr) => {
    return acc[curr] || {}
  }, data)
  return enumValue
}
const calculate = ({
  bindType,
  sortKey,
  graph,
  colorKey
}) => {
  const data = graph.save()
  const treeData = data
  const graphData = data
  const nodeMapByMapKey = new Map()
  const edgeMapByMapKey = new Map()
  /** 暂时不支持treeGraph的legend */
  if (treeData.children) {
    console.error('not support tree graph')
    return {
      dataMap: new Map(),
      options: {}
    }
  }
  const {
    nodes = [],
    edges = []
  } = graphData
  if (bindType === 'node') {
    nodes.forEach(node => {
      /** 得到枚举值 */
      const enumValue = getEnumValue(sortKey, node)
      /** 按照枚举值重新将节点存放 */
      const current = nodeMapByMapKey.get(enumValue)
      if (current) {
        nodeMapByMapKey.set(enumValue, [...current, node])
      } else {
        nodeMapByMapKey.set(enumValue, [node])
      }
    })
    /** 计算legend.content 的 options */
    const keys = [...nodeMapByMapKey.keys()]
    const options = keys.map(key => {
      const node = (nodeMapByMapKey.get(key) || [{}])[0]
      const nodeLength = (nodeMapByMapKey.get(key) || [{}]).length
      const color = getEnumValue(colorKey, node)
      return {
        /** 颜色 */
        color,
        /** 值 */
        value: key,
        /** 标签 */
        label: key,
        /** 是否选中 */
        checked: true,
        num: nodeLength
      }
    })
    return {
      dataMap: nodeMapByMapKey,
      options
    }
  }
  // if (bindType === 'edge') {
  edges.forEach(edge => {
    /** 得到枚举值 */
    const enumValue = getEnumValue(sortKey, edge)
    const current = edgeMapByMapKey.get(enumValue)
    if (current) {
      edgeMapByMapKey.set(enumValue, [...current, edge])
    } else {
      edgeMapByMapKey.set(enumValue, [edge])
    }
  })
  /** 计算legend.content 的 options */
  const keys = [...edgeMapByMapKey.keys()]
  const options = keys.map(key => {
    const edge = (edgeMapByMapKey.get(key) || [{}])[0]
    const color = getEnumValue(colorKey, edge)
    return {
      /** 颜色 */
      color,
      /** 值 */
      value: key,
      /** 标签 */
      label: key,
      /** 是否选中 */
      checked: true
    }
  })
  return {
    dataMap: edgeMapByMapKey,
    options
  }
}
const defaultStyle = {
  position: 'absolute',
  top: '0px',
  right: '0px'
}
const Legend = {
  props: ['bindType', 'sortKey', 'colorKey', 'styleSet'],
  setup (props, context) {
    const calLengend = () => {
      const graphin = useContext()
      const { graph } = graphin
      const {
        bindType,
        sortKey,
        colorKey = 'style.stroke'
      } = props
      const {
        dataMap,
        options
      } = calculate({
        bindType,
        sortKey,
        graph,
        colorKey
      })
      graphin.legend = {
        ...graphin.legend,
        // 一个Graphin组件下，最多仅有2个Legend组件：node和edge
        [bindType]: {
          bindType,
          sortKey,
          colorKey,
          dataMap,
          options
        }
      }
    }
    calLengend()
    onUpdated(() => {
      calLengend()
    })
    return () => <div class="graphin-components-legend" style={{ ...defaultStyle }}>
      {context.slots.default()}
    </div>
  }
}
export { Legend, LegendNode }
export default Legend
