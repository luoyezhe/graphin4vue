import { useContext, G6 } from '@graphin'
import { onMounted, ref, watchEffect } from 'vue'

const defaultOptions = {
  className: 'graphin-minimap',
  viewportClassName: 'graphin-minimap-viewport',
  // Minimap 中默认展示和主图一样的内容，KeyShape 只展示节点和边的 key shape 部分，delegate表示展示自定义的rect，用户可自定义样式
  type: 'default',
  padding: 50,
  size: [200, 120],
  delegateStyle: {
    fill: '#40a9ff',
    stroke: '#096dd9'
  },
  refresh: true
}
const styles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    background: '#fff',
    boxShadow: '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)'
  }
}
const containerHeight = 120

const MiniMap = {
  props: {
    visible: Boolean,
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  setup (props, context) {
    const { graph } = useContext()
    const containerRef = ref()
    onMounted(() => {
      watchEffect((onInvalidate) => {
        const options = props.options
        const width = graph.getWidth()
        const height = graph.getHeight()
        const padding = graph.get('fitViewPadding')
        const containerSize = [((width - padding[0] * 2) / (height - padding[1] * 2)) * containerHeight, containerHeight]
        const miniMapOptions = {
          container: containerRef.value,
          ...defaultOptions,
          size: containerSize,
          ...options
        }
        const miniMap = new G6.Minimap(miniMapOptions)
        graph.addPlugin(miniMap)
        onInvalidate(() => {
          graph.removePlugin(miniMap)
        })
      })
    })
    const mergedStyle = {
      ...styles.container
    }
    return () =>
      <div
        ref={(ref) => { containerRef.value = ref }}
        style={ mergedStyle }
      />
  }
}
export default MiniMap
