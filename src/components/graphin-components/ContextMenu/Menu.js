import { useContext } from '@graphin'
import './index.less'

const CItem = {
  setup (props, context) {
    // const { listeners } = context
    const children = context.slots.default
    const {
      click: onClick = () => {
      }
    } = context.attrs
    const graphin = useContext()
    const handleClose = () => {
      onClick()
      const { contextmenu } = graphin
      // 临时方案
      if (contextmenu.node) {
        contextmenu.node.handleClose()
      }
      if (contextmenu.edge) {
        contextmenu.edge.handleClose()
      }
      if (contextmenu.canvas) {
        contextmenu.canvas.handleClose()
      }
    }
    return () => <li onClick={handleClose}>{children()}</li>
  }
  // inheritAttrs: false
}

const CMenu = {
  props: {
    options: Object,
    bindType: String,
    onChange: Function
  },
  setup (props, context) {
    const {
      bindType = 'node',
      options
    } = props
    const graphin = useContext()
    const { change: onChange } = props
    const { contextmenu } = graphin
    const handleClick = (e) => {
      try {
        let item = null
        if (bindType === 'node') {
          item = contextmenu.node.item.getModel()
        }
        if (bindType === 'edge') {
          item = contextmenu.edge.item.getModel()
        }
        if (bindType === 'canvas') {
          item = null
        }
        if (onChange) {
          onChange(e, item)
          contextmenu[bindType].handleClose()
        }
      } catch (error) {
        console.log(error)
      }
    }
    const children = context.slots.default
    if (options) {
      return () => <ul class='graphin-components-contextmenu-content'>{
        options.map((c) => {
          const { key, icon, name } = c
          return <CItem ket={key || name} onClick={() => {
            handleClick(c)
          }}>{icon} {name}</CItem>
        })
      }</ul>
    }
    return () => <ul class='graphin-components-contextmenu-content'>{children()}</ul>
  },
  components: {
    CItem: CItem
  }
}

export { CMenu, CItem }
