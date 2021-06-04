import './index.less'
import { useContext } from '@graphin'

const defaultStyle = {
  background: '#fff'
}

const ToolbarItem = {
  name: 'ToolbarItem',
  setup (props, context) {
    const {
      onClick
    } = context.attrs
    return () => <li onClick={onClick} onKeyDown={onClick}>{context.slots.default()}</li>
  }
}

const Toolbar = {
  props: {
    /*
    * @description ToolbarItem的布局位置：'vertical' | 'horizontal'
    * @default horizontal
    * */
    direction: {
      type: String,
      default: 'horizontal'
    },
    /*
    * @description Toolbar 的配置选项
    * @default horizontal
    * */
    options: {
      type: Array,
      default () {
        return []
      }
    },
    styleSet: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  setup (props, context) {
    const {
      styleSet: style = {},
      direction = 'horizontal',
      options
    } = props
    const { onChange } = context.attrs
    const graphinContext = useContext()
    const isHorizontal = direction === 'horizontal'
    const positionStyle = {
      position: 'absolute'
    }
    // 水平方向，默认在右上角
    if (isHorizontal) {
      positionStyle.right = 0
      positionStyle.top = 0
    } else {
      // 垂直方向，默认在左下角
      positionStyle.left = 0
      positionStyle.bottom = 0
    }
    const handleClick = option => {
      try {
        if (onChange) {
          onChange(graphinContext, option)
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (options.length) {
      return () => <div className="graphin-components-toolbar" style={{ ...defaultStyle, ...positionStyle, ...style }}>
        <ul className="graphin-components-toolbar-content" style={{ display: isHorizontal ? 'flex' : '' }}>
          {options.map((option) => {
            const { key, name } = option
            return <ToolbarItem key={key || name} onClick={() => {
              handleClick(option)
            }}>{name}</ToolbarItem>
          })}
        </ul>
      </div>
    }
    // const children = context.slots.default()
    // return () => <div style={{ ...defaultStyle, ...positionStyle, ...style }} className="graphin-components-toolbar">
    //   {isArray(children) || (children && ())}
    // </div>
    return () => {
      const children = context.slots.default()
      const childLen = children.length
      return <div className="graphin-components-toolbar" style={{ ...defaultStyle, ...positionStyle, ...style }}>
        { childLen > 1 || (childLen === 1 && children[0].type.name === ToolbarItem.name)
          ? <ul className="graphin-components-toolbar-content"
            style={{ display: isHorizontal ? 'flex' : '' }}>{children}</ul> : { children }}
      </div>
    }
  }
}

Toolbar.Item = ToolbarItem
export {
  Toolbar,
  ToolbarItem
}
export default Toolbar
