import useState from './useState'
import { useContext } from '@graphin'
import { watchEffect, ref } from 'vue'
import TooltipNode from './Node'
import TooltipEdge from './Edge'

const defaultStyle = {
  width: '200px',
  background: '#fff'
}
const getTranslate = ({
  placement,
  nodeSize,
  x,
  y,
  bindType = 'node',
  visible
}) => {
  if (bindType === 'edge') {
    return {
      left: `${x}px`,
      top: `${y}px`
    }
  }

  if (placement === 'top') {
    if (visible) {
      return {
        left: `${x}px`,
        top: `${y - nodeSize / 2}px`,
        opacity: 1,
        transform: 'translate(-50%,calc(-100% - 6px))',
        transition: 'opacity 0.5s,transform 0.5s'
      }
    }
    return {
      left: 0,
      top: 0,
      opacity: 0.5,
      transform: 'translate(-50%,-100%)'
    }
  }
  if (placement === 'bottom') {
    if (visible) {
      return {
        left: `${x}px`,
        top: `${y + nodeSize / 2}px`,
        opacity: 1,
        transform: 'translate(-50%,6px)',
        transition: 'opacity 0.5s,transform 0.5s'
      }
    }
    return {
      left: `${x}px`,
      top: `${y + nodeSize / 2}px`,
      opacity: 0.5,
      transform: 'translate(-50%,0px)'
    }
  }
  if (placement === 'left') {
    if (visible) {
      return {
        left: `${x - nodeSize / 2}px`,
        top: `${y}px`,
        transform: 'translate(calc(-100% - 6px),-50%)',
        opacity: 1,
        transition: 'opacity 0.5s,transform 0.5s'
      }
    }
    return {
      opacity: 0,
      left: `${x - nodeSize / 2}px`,
      top: y,
      transform: 'translate(-100%,-50%)'
    }
  }
  if (placement === 'right') {
    if (visible) {
      return {
        left: `${x + nodeSize / 2}px`,
        top: `${y}px`,
        transform: 'translate(6px,-50%)',
        opacity: 1,
        transition: 'opacity 0.5s,transform 0.5s'
      }
    }
    return {
      left: `${x + nodeSize / 2}px`,
      top: `${y}px`,
      transform: 'translate(0,-50%)',
      opacity: 0
    }
  }
  if (placement === 'center') {
    if (visible) {
      return {
        left: `${x}px`,
        top: `${y}px`,
        opacity: 1,
        transition: 'opacity 0.5s,transform 0.5s'
      }
    }
    return {
      left: `${x}px`,
      top: `${y}px`,
      opacity: 0
    }
  }
  return {
    left: `${x}px`,
    top: `${y}px`
  }
}

const Tooltip = {
  props: ['bindType', 'placement', 'hasArrow'],
  setup (props, context) {
    const { bindType = 'node', hasArrow, placement } = props
    const containerRef = ref()
    const graphin = useContext()
    const { graph } = graphin
    const [state, setState] = useState({
      visible: false,
      x: 0,
      y: 0,
      item: null
    })
    const handleShow = (e) => {
      e.preventDefault()
      e.stopPropagation()

      const point = graph.getPointByClient(e.clientX, e.clientY)
      let { x, y } = graph.getCanvasByPoint(point.x, point.y)

      if (bindType === 'node') {
        // 如果是节点，则x，y指定到节点的中心点
        if (e.item) {
          const {
            x: PointX = 0,
            y: PointY = 0
          } = e.item.getModel()
          const CenterCanvas = graph.getCanvasByPoint(PointX, PointY)

          const daltX = e.canvasX - CenterCanvas.x
          const daltY = e.canvasY - CenterCanvas.y
          x = x - daltX
          y = y - daltY
          if (e.item.getModel().type === 'graphin-rect') {
            const size = (e.item && e.item.getModel().size)
            const padding = (e.item && e.item.getModel().padding)
            x = x + size[0] / 2 + padding[0]
            y = y + size[1] / 2 + padding[1] / 2
          }
        }
      }
      /** 设置变量 */
      setState({
        ...state,
        visible: true,
        item: e.item,
        x,
        y
      })
    }
    const handleClose = () => {
      setState({
        ...state,
        visible: false,
        item: null,
        x: 0,
        y: 0
      })
    }
    const handleDragStart = () => {
      setState({
        ...state,
        visible: false,
        x: 0,
        y: 0,
        item: null
      })
    }
    const handleDragEnd = e => {
      const point = graph.getPointByClient(e.clientX, e.clientY)
      let { x, y } = graph.getCanvasByPoint(point.x, point.y)
      if (bindType === 'node') {
        // 如果是节点，则x，y指定到节点的中心点
        if (e.item) {
          const { x: PointX = 0, y: PointY = 0 } = e.item.getModel()
          const CenterCanvas = graph.getCanvasByPoint(PointX, PointY)

          const daltX = e.canvasX - CenterCanvas.x
          const daltY = e.canvasY - CenterCanvas.y
          x = x - daltX
          y = y - daltY
        }
        setState({
          ...state,
          visible: true,
          x,
          y,
          item: e.item
        })
      }
    }
    watchEffect((onInvalidate) => {
      graph.on(`${bindType}:mouseenter`, handleShow)
      graph.on(`${bindType}:mouseleave`, handleClose)
      graph.on('afterremoveitem', handleClose)
      graph.on('node:dragstart', handleDragStart)
      graph.on('node:dragend', handleDragEnd)
      // graph.on(`${bindType}:mousemove`, handleUpdatePosition);
      onInvalidate(() => {
        graph.off(`${bindType}:mouseenter`, handleShow)
        graph.off(`${bindType}:mouseleave`, handleClose)
        graph.off('afterremoveitem', handleClose)
        graph.off('node:dragstart', handleDragStart)
        graph.off('node:dragend', handleDragEnd)
        // graph.off(`${bindType}:mousemove`, handleUpdatePosition);
      })
    })

    // let nodeSize = 40
    // try {
    //   const modelStyle = item.value?.getModel().style
    //   if (modelStyle) {
    //     nodeSize = modelStyle.keyshape.size
    //     const type = item.value?.getModel()?.type
    //     if (type === 'graphin-rect') {
    //       nodeSize = modelStyle.keyshape.height
    //     }
    //   }
    // } catch (error) {
    //   console.log(error)
    // }
    // const containerPosition = getTranslate({
    //   placement,
    //   nodeSize: nodeSize + padding,
    //   x,
    //   y,
    //   bindType,
    //   visible
    // })
    // const positionStyle = {
    //   position: 'absolute',
    //   ...containerPosition
    // }

    const padding = 12
    let nodeSize = 40
    let containerPosition
    let positionStyle
    /** 将一些方法和数据传递给子组件 */
    watchEffect(() => {
      const { x, y, visible, item } = state
      try {
        const bbox = item?.getBBox()
        nodeSize = bbox?.height
      } catch (error) {
        console.error(error)
      }
      graphin.tooltip = {
        ...graphin.tooltip,
        [bindType]: {
          handleOpen: handleShow,
          handleClose,
          item,
          visible,
          x,
          y
        }
      }
      containerPosition = getTranslate({
        placement,
        nodeSize: nodeSize + padding,
        x,
        y,
        bindType,
        visible
      })
      positionStyle = {
        position: 'absolute',
        ...containerPosition
      }
    })

    return () => <div
      ref={ (ref) => { containerRef.value = ref } }
      className={['graphin-components-tooltip', { placement }].join(' ')}
      style={{ ...defaultStyle, ...positionStyle }}>
      {state.visible && (
        <div>
          {hasArrow && <div className={`tooltuo-arrow ${placement}`} />}
          {context.slots.default()}
        </div>
      )}
    </div>
  }
}

export { Tooltip, TooltipNode, TooltipEdge }
