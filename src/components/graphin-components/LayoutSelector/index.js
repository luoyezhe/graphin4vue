const LayoutConfigPanel = ({
  children,
  props
}) => {
  const { style } = props
  return <div class="graphin-components-layoutselector" style={style}>
    {children}
  </div>
}

export default LayoutConfigPanel
