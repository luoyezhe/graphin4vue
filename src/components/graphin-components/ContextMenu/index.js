import useState from './useState'
import { useContext } from '@graphin'
import { watchEffect, ref } from 'vue'
import { CMenu, CItem } from './Menu'

const defaultStyle = {
  width: 200,
  background: '#fff'
}
const ContextMenu = {
  props: {
    bindType: {
      type: String,
      default: 'node'
    }
  },
  setup (props, context) {
    const containerRef = ref()
    const { bindType = 'node' } = props
    const graphin = useContext()
    const { graph } = graphin
    const [state, setState] = useState()
    const handleShow = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const width = graph.get('width')
      const height = graph.get('height')

      const bbox = containerRef.value.getBoundingClientRect()

      const offsetX = graph.get('offsetX') || 0
      const offsetY = graph.get('offsetY') || 0

      const graphTop = graph.getContainer().offsetTop
      const graphLeft = graph.getContainer().offsetLeft

      let x = e.canvasX + graphLeft + offsetX
      let y = e.canvasY + graphTop + offsetY

      // when the menu is (part of) out of the canvas

      if (x + bbox.width > width) {
        x = e.canvasX - bbox.width - offsetX + graphLeft
      }
      if (y + bbox.height > height) {
        y = e.canvasY - bbox.height - offsetY + graphTop
      }

      if (bindType === 'node') {
        // 如果是节点，则x，y指定到节点的中心点
        const {
          x: PointX,
          y: PointY
        } = (e.item && e.item.getModel())
        const CenterCanvas = graph.getCanvasByPoint(PointX, PointY)

        const daltX = e.canvasX - CenterCanvas.x
        const daltY = e.canvasY - CenterCanvas.y
        x = x - daltX
        y = y - daltY
        // if (e.item.getModel().type === 'graphin-rect') {
        //   const size = (e.item && e.item.getModel().size)
        //   const padding = (e.item && e.item.getModel().padding)
        //   x = x + size[0] / 2 + padding[0]
        //   y = y + size[1] / 2 + padding[1] / 2
        // }
      }
      /** 设置变量 */
      setState({
        ...state,
        visible: true,
        x,
        y,
        item: e.item
      })
    }
    const handleClose = () => {
      if (state.visible) {
        setState({
          ...state,
          visible: false,
          x: 0,
          y: 0
        })
      }
    }
    watchEffect((onInvalidate) => {
      graph.on(`${bindType}:contextmenu`, handleShow)
      graph.on('canvas:click', handleClose)
      graph.on('canvas:drag', handleClose)
      graph.on('canvas:drag', handleClose)
      graph.on('wheelzoom', handleClose)

      onInvalidate(() => {
        graph.off(`${bindType}:contextmenu`, handleShow)
        graph.off('canvas:click', handleClose)
        graph.off('canvas:drag', handleClose)
        graph.off('wheelzoom', handleClose)
      })
    })

    /** 将一些方法和数据传递给子组件 */
    graphin.contextmenu = {
      ...graphin.contextmenu,
      [bindType]: {
        handleOpen: handleShow,
        handleClose,
        item: state.item,
        visible: state.visible,
        x: state.x,
        y: state.y,
        bindType
      }
    }
    const id = (state.item && !state.item.destroyed && state.item.getModel && state.item.getModel().id) || ''
    return () => <div
      className="graphin-components-contextmenu"
      ref={(ref) => { containerRef.value = ref }}
      style={{ ...defaultStyle, position: 'absolute', left: state.x + 'px', top: state.y + 'px' }}
      key={id}
    >
      { state.visible ? context.slots.default() : '' }
    </div>
  }
}
export { ContextMenu, CItem, CMenu }
