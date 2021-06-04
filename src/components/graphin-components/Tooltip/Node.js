import './index.less'
import { h } from 'vue'
import { useContext } from '@graphin'

const TooltipNode = {
  props: ['render'],
  setup (props) {
    const { render } = props
    const graphin = useContext()
    const { tooltip } = graphin
    const context = tooltip.node
    const { item } = context
    if (typeof render !== 'function') {
      console.error('<TooltipNode /> render should be a function')
      return null
    }

    return () => {
      const children = render(h, item)
      return <div class='graphin-components-tooltip-content'>{children}</div>
    }
  }
}

export default TooltipNode
