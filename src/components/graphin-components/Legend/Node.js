import { useContext } from '@graphin'
import { watch } from 'vue'
import useOptions from './useOptions'
import './index.less'

const LegendNode = {
  setup (props, context) {
    const graphin = useContext()
    const {
      legend,
      graph,
      theme
    } = graphin
    // 依然存在两个legend，graphin.context只是一个全局对象
    const {
      onChange = () => {
      }
    } = context.attrs
    const { mode } = theme
    const [data, setOptions] = useOptions()
    const {
      options: defaultOptions,
      dataMap
    } = legend.node
    data.options = defaultOptions
    /** 更新state依赖 */
    watch(() => graphin.legend, (newVal) => {
      setOptions(newVal.node.options)
    })
    const handleClick = (option) => {
      const checkedValue = {
        ...option,
        checked: !option.checked
      }
      const result = data.options.map(c => {
        const matched = c.value === option.value
        return matched ? checkedValue : c
      })
      setOptions(result)
      const nodes = dataMap.get(checkedValue.value)
      /** highlight */
      // const nodesId = nodes.map((c) => c.id)
      // apis.highlightNodeById(nodesId)
      nodes.forEach(node => {
        graph.setItemState(node.id, 'active', checkedValue.checked)
        graph.setItemState(node.id, 'inactive', !checkedValue.checked)
      })
      /** 给用户的回调函数 */
      onChange(checkedValue, result, context.attrs)
    }
    return () => (<ul class="graphin-components-legend-content">
      {
        data.options.map((option) => {
          const {
            label,
            checked,
            color,
            num
          } = option
          const dotColors = {
            light: {
              active: color,
              inactive: '#ddd'
            },
            dark: {
              active: color,
              inactive: '#2f2f2f'
            }
          }
          const labelColor = {
            light: {
              active: '#000',
              inactive: '#ddd'
            },
            dark: {
              active: '#fff',
              inactive: '#2f2f2f'
            }
          }
          const status = checked ? 'active' : 'inactive'

          return <li class="item" onClick={() => {
            handleClick(option)
          }} onKeyDown={() => {
            handleClick(option)
          }}>
            <span class="dot" style={{ background: dotColors[mode][status] }}></span>
            <span class="label" style={{ color: labelColor[mode][status] }}>{label}{num}</span>
          </li>
        })
      }
    </ul>)
  }
}
export default LegendNode
