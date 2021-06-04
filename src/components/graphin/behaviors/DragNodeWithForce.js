import { watchEffect } from 'vue'
import { useContext } from '@graphin'

const DragNodeWithForce = {
  props: ['autoPin'],
  setup (props) {
    const {
      graph,
      layout
    } = useContext()
    watchEffect((onInvalidate) => {
      const { autoPin } = props
      const { instance } = layout
      const {
        simulation,
        type
      } = instance
      const handleNodeDragStart = () => {
        if (simulation) {
          simulation.stop()
        }
      }
      const handleNodeDragEnd = (e) => {
        if (type !== 'graphin-force') {
          return
        }
        if (e.item) {
          console.log('e.item', instance)
          const nodeModel = e.item.get('model')
          nodeModel.x = e.x
          nodeModel.y = e.y
          nodeModel.layout = {
            ...nodeModel.layout,
            force: {
              mass: autoPin ? 1000000 : null
            }
          }
          const drageNodes = [nodeModel]
          simulation.restart(drageNodes, graph)
          graph.refreshPositions()
        }
      }
      graph.on('node:dragstart', handleNodeDragStart)
      graph.on('node:dragend', handleNodeDragEnd)
      onInvalidate(() => {
        graph.off('node:dragstart', handleNodeDragStart)
        graph.off('node:dragend', handleNodeDragEnd)
      })
      return () => null
    })
  }
}

export default DragNodeWithForce
