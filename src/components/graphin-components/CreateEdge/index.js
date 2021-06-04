import { watchEffect } from 'vue'
import { useContext } from '@graphin'
const CreateEdge = {
  props: {
    /** 是否激活建立连线模式 */
    active: Boolean
  },
  setup (props, context) {
    const { onChange, onClick } = context.attrs

    const { graph } = useContext()

    watchEffect((onInvalidate) => {
      if (props.active) {
        graph.addBehaviors(
          {
            type: 'create-edge'
          },
          'default'
        )
        graph.get('canvas').setCursor('crosshair')
      }

      const handleAfterCreateEdge = (e) => {
        const edges = graph.getEdges().map((v) => {
          return v.getModel()
        })

        if (onChange) {
          onChange(edges, e.edge)
        }
      }

      graph.on('aftercreateedge', handleAfterCreateEdge)

      onInvalidate(() => {
        graph.removeBehaviors('create-edge', 'default')
        graph.get('canvas').setCursor('default')
        graph.off('aftercreateedge', handleAfterCreateEdge)
      })
    })

    return () => <div className="graphin-create-edge-icon" onClick={onClick}>
      {context.slots.default()}
    </div>
  }
}

export default CreateEdge
