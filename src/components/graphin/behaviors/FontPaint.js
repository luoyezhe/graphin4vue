import { watchEffect } from 'vue'
import { useContext } from '../Provide'
const FontPaint = {
  setup () {
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const timer = setTimeout(() => {
        graph.getNodes().forEach((node) => {
          graph.setItemState(node, 'normal', true)
        })
        graph.paint()
      }, 1600)
      onInvalidate(() => {
        clearTimeout(timer)
      })
    })
    return () => null
  }
}

export default FontPaint
