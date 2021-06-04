import { Layout } from '@antv/layout'

const subLayout = () => {
  const newData = {
    nodes: [],
    edges: [],
    combos: null
  }
  return {
    add: (data, layout) => {
      const layoutInstance = new Layout(layout)
      // TODO:计算数据中最小包围盒，从而计算布局所需要的中心点和宽高
      const subData = layoutInstance.layout(data)
      newData.nodes = [...newData.nodes, ...subData.nodes]
      newData.edges = [...newData.edges, ...subData.edges]
    },
    layout: () => {
      return newData
    }
  }
}
export default subLayout
