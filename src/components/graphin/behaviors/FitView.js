import { watchEffect } from 'vue'
import { useContext } from '@graphin'
const FitView = {
  props: {
    padding: {
      type: Array,
      default () {
        return [0, 0]
      }
    },
    isBindLayoutChange: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const { padding, isBindLayoutChange } = props
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const handleFitView = () => {
        graph.fitView(padding)
      }
      /** 第一次就执行 FitView */
      handleFitView()
      if (isBindLayoutChange) {
        graph.on('afterlayout', handleFitView)
      }
      onInvalidate(() => {
        if (isBindLayoutChange) {
          graph.off('afterlayout', handleFitView)
        }
      })
    })
    return () => null
  }
}

export default FitView
