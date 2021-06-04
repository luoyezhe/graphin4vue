import getNodeStyleByTheme from './node-style'
import getEdgeStyleByTheme from './edge-style'
import getComboStyleByTheme from './combo-style'

export const DEFAULT_THEME = {
  mode: 'light',
  primaryColor: '#FF6A00',
  nodeSize: 26,
  edgeSize: 1,
  primaryEdgeColor: '#ddd'
}

export const getDefaultStyleByTheme = (inputTheme) => {
  const theme = { ...DEFAULT_THEME, ...inputTheme }
  const {
    primaryColor,
    primaryEdgeColor,
    nodeSize,
    edgeSize,
    mode,
    background
  } = theme
  const nodeStyle = getNodeStyleByTheme({
    primaryColor,
    nodeSize,
    mode
  })
  const edgeStyle = getEdgeStyleByTheme({
    primaryEdgeColor,
    edgeSize,
    mode
  })
  const comboStyle = getComboStyleByTheme()
  const BackgroundStyle = {
    light: '#fff',
    dark: '#1f1f1f'
  }
  return {
    ...theme,
    mode,
    background: background || BackgroundStyle[mode],
    defaultNodeStyle: {
      type: nodeStyle.type,
      style: nodeStyle.style
    },
    defaultNodeStatusStyle: { status: nodeStyle.status },
    defaultEdgeStyle: {
      type: edgeStyle.type,
      style: edgeStyle.style
    },
    defaultEdgeStatusStyle: { status: edgeStyle.status },
    defaultComboStyle: {
      type: comboStyle.type,
      style: comboStyle.style
    },
    defaultComboStatusStyle: { status: comboStyle.status }
  }
}
