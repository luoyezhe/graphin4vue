import { useContext } from '@graphin'

const Delete = {
  setup (props, context) {
    const {
      bindType = 'node',
      rule
    } = props
    const { graph } = useContext()
    const deleteFun = () => {
      let elements
      if (rule) {
        elements = graph.findAll('node', rule)
      } else {
        elements = graph.findAllByState(bindType, 'selected')
      }

      elements.forEach((element) => {
        graph.removeItem(element, true)
      })
    }
    return () => {
      let children = context.slots.default
      children = children ? children() : '删除'
      return <div onClick={deleteFun}>{children}</div>
    }
  }
}
export { Delete }
