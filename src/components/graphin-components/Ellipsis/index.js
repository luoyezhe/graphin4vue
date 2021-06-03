import { useContext, G6 } from '@graphin'
import { watchEffect } from 'vue'

const Ellipsis = {
  setup () {
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        itemTypes: ['node', 'edge'],
        shouldBegin (e) {
          return e.item.getModel().ellipsis
        },
        getContent: (e) => {
          const outDiv = document.createElement('div')
          outDiv.style.width = 'fit-content'
          outDiv.innerHTML = `<div>${e.item.getModel()._label}</div>`
          return outDiv
        }
      })
      graph.addPlugin(tooltip)
      onInvalidate(() => {
        graph.removePlugin(tooltip)
      })
    })
    return () => null
  }
}
export default Ellipsis
