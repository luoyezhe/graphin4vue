// import { debounce } from '@antv/util'
import { watchEffect } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useContext } from '../Provide'

const ResizeCanvas = {
  props: ['graphDOM'],
  setup (props) {
    const { graphDOM } = props
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const handleResizeEvent = useDebounceFn(() => {
        const {
          clientWidth,
          clientHeight
        } = graphDOM
        graph.set('width', clientWidth)
        graph.set('height', clientHeight)
        const canvas = graph.get('canvas')
        if (canvas) {
          canvas.changeSize(clientWidth, clientHeight)
          graph.autoPaint()
        }
      }, 200)
      /** 内置 drag force node */
      window.addEventListener('resize', handleResizeEvent, false)
      onInvalidate(() => {
        window.removeEventListener('resize', handleResizeEvent, false)
      })
    })
    return () => null
  }
}

export default ResizeCanvas
