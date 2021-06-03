import { deepMix } from '@antv/util'
import cloneDeep from 'lodash-es/cloneDeep'
import Graphin from '../Graphin'
import IconLoader from '@graphin-icons'

const defaultFontFamily = window.getComputedStyle(document.body, null).getPropertyValue('font-family')

const icons = Graphin.registerFontFamily(IconLoader)
const fontSize = 16
const nodesBFC = {
  width: 220,
  height: 40,
  padding: 14,
  minWidth: 206,
  fontSize: fontSize,
  fontFamily: `${fontSize}px ${defaultFontFamily}`
}
const PrimaryStyle = {
  padding: 14,
  size: [220, 40],
  width: 220,
  height: 40,
  edgeSize: 1,
  primaryNodeColor: '#5D8AF4',
  primaryEdgeColor: '#DCDFE4',
  primaryNodeRadius: [0, 2, 2, 0],
  primarySelectedNodeRadius: [2, 2, 2, 2],
  primaryActiveHaloRadius: [2, 2, 2, 2],
  primaryLeftRadius: [2, 0, 0, 2],
  primarySelectedEdgeColor: '#5D8AF4',
  primaryActiveEdgeColor: '#5D8AF4',
  primarySelectedEdgeHaloColor: '#DCDFE4',
  primarySelectedNodeHaloColor: '#DCDFE4',
  primaryActiveNodeHaloColor: '#DCDFE4',
  PrimaryNodeLabelColor: '#000',
  primaryNodeLabelfontSize: fontSize,
  primaryEdgeLabelColor: '#66686C',
  primaryEdgeLabelOffset: [0, 13],
  primaryEdgeLabelFontSize: 12,
  PrimaryInactiveNodeLabelColor: '#AFB5C0',
  primarySelectedNodeLabelColor: '#fff',
  primaryInActiveNodeColor: '#F1F3F8',
  primaryInActiveNodeStroke: '#AFB5C0',
  primaryInActiveEdgeColor: '#AFB5C0',
  primaryActiveEdgeHaloColor: '#DCDFE4',
  disableColor: '#ddd'
}

const dStyle = {
  primaryNodeColor: PrimaryStyle.primaryNodeColor,
  width: PrimaryStyle.width,
  height: PrimaryStyle.height,
  edgeSize: 1,
  primaryEdgeColor: PrimaryStyle.primaryEdgeColor,
  radius: PrimaryStyle.radius,
  size: [220, 40],
  padding: PrimaryStyle.padding,
  background: '#fff',
  defaultNodeStyle: {
    type: 'graphin-rect',
    padding: PrimaryStyle.padding,
    size: [220, 40],
    style: {
      keyshape: {
        width: PrimaryStyle.width,
        height: PrimaryStyle.height,
        fill: PrimaryStyle.primaryNodeColor,
        stroke: PrimaryStyle.primaryNodeColor,
        fillOpacity: 0.1,
        strokeOpacity: 1,
        lineWidth: 1,
        opacity: 1,
        type: 'rect',
        radius: PrimaryStyle.primaryNodeRadius
      },
      label: {
        position: 'bottom',
        value: '',
        fill: PrimaryStyle.PrimaryNodeLabelColor,
        fontSize: PrimaryStyle.primaryNodeLabelfontSize,
        offset: 0,
        fillOpacity: 1
      },
      icon: {
        type: 'text',
        value: '',
        size: 20,
        fill: PrimaryStyle.primaryNodeColor,
        fillOpacity: 1,
        offset: [0, 0]
      },
      badges: [],
      halo: {
        visible: false,
        fillOpacity: 0.1
      },
      leftShape: {
        visible: true,
        radius: PrimaryStyle.primaryLeftRadius,
        fill: PrimaryStyle.primaryNodeColor,
        stroke: PrimaryStyle.primaryNodeColor
      }
    }
  },
  defaultNodeStatusStyle: {
    status: {
      normal: {},
      selected: {
        halo: {
          visible: true,
          fillOpacity: 1,
          fill: PrimaryStyle.primarySelectedNodeHaloColor
        },
        keyshape: {
          fillOpacity: 1,
          radius: PrimaryStyle.primarySelectedNodeRadius
        },
        label: {
          fill: PrimaryStyle.primarySelectedNodeLabelColor
        },
        leftShape: {
          visible: false
        }
      },
      hover: {},
      active: {
        halo: {
          fillOpacity: 1,
          fill: PrimaryStyle.primaryActiveNodeHaloColor,
          visible: true,
          x: -9,
          width: PrimaryStyle.width + 15,
          radius: PrimaryStyle.primaryActiveHaloRadius
        },
        keyshape: {
          fillOpacity: 0.5
        }
      },
      inactive: {
        keyshape: {
          fill: PrimaryStyle.primaryInActiveNodeColor,
          stroke: PrimaryStyle.primaryInActiveNodeStroke

        },
        icon: {
          fillOpacity: 0.04
        },
        label: {
          color: PrimaryStyle.PrimaryInactiveNodeLabelColor
        },
        leftShape: {
          fill: PrimaryStyle.primaryInActiveNodeStroke,
          stroke: PrimaryStyle.primaryInActiveNodeStroke
        }
      },
      disabled: {
        halo: {
          visible: false
        },
        keyshape: {
          fill: PrimaryStyle.disableColor,
          stroke: PrimaryStyle.disableColor
        },
        icon: {
          fill: PrimaryStyle.disableColor
        },
        label: {
          fill: PrimaryStyle.disableColor
        }
      }
    }
  },
  defaultEdgeStyle: {
    type: 'graphin-rect-line',
    style: {
      keyshape: {
        type: 'line',
        lineWidth: PrimaryStyle.edgeSize,
        stroke: PrimaryStyle.primaryEdgeColor,
        strokeOpacity: 1,
        lineAppendWidth: 9,
        cursor: 'pointer'
      },
      halo: {
        visible: false,
        cursor: 'pointer',
        strokeOpacity: 0.4
      },
      label: {
        value: '',
        position: 'top',
        fill: PrimaryStyle.primaryEdgeLabelColor,
        fontSize: 12,
        textAlign: 'center',
        offset: PrimaryStyle.primaryEdgeLabelOffset
      }
    }
  },
  defaultEdgeStatusStyle: {
    status: {
      hover: {
        halo: {
          visible: true
        }
      },
      selected: {
        halo: {
          visible: true
        },
        keyshape: {
          lineWidth: 2,
          stroke: PrimaryStyle.primarySelectedEdgeColor
        }
      },
      active: {
        halo: {
          visible: true
        },
        keyshape: {
          lineWidth: 2,
          stroke: PrimaryStyle.primaryActiveEdgeColor
        }
      },
      inactive: {
        halo: {
          visible: false
        },
        keyshape: {
          stroke: PrimaryStyle.primaryInActiveEdgeColor,
          lineWidth: 1
        }
      },
      disabled: {
        halo: {
          visible: false
        },
        keyshape: {
          lineWidth: 0.5,
          stroke: PrimaryStyle.disableColor
        }
      }
    }
  }
}

class ToolCanvas {
  constructor () {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.fontFamily = nodesBFC.fontFamily
    this.setFont()
  }

  setFont (fontFamily) {
    this.context.font = fontFamily || this.fontFamily
  }
}

class ParseLabel extends ToolCanvas {
  constructor (nodesBFC) {
    super()
    this.props = { ...nodesBFC }
  }

  parseLabelWidth (text) {
    const {
      minWidth,
      padding
    } = this.props
    const dimensionWidth = this.measureLabelWidth(text)
    const pointWidth = this.parsePointWidth()
    return dimensionWidth > minWidth ? minWidth + padding + pointWidth : dimensionWidth + padding
  }

  parsePointWidth () {
    return this.measureLabelWidth('...')
  }

  measureLabelWidth (text) {
    const { context } = this
    return context.measureText(text).width
  }

  parseWraps (text, minWidth) {
    let sliceText = text
    let sliceIndex
    const textLen = text.length
    for (let i = 0; i <= textLen; i++) {
      const sliceWidth = this.measureLabelWidth(text.slice(0, i))
      if (sliceWidth >= minWidth) {
        sliceIndex = i
        break
      }
    }
    if (sliceIndex) {
      sliceText = ''
      const textNum = Math.ceil(textLen / sliceIndex)
      for (let i = 0; i < textNum; i++) {
        sliceText += text.slice(sliceIndex * i, sliceIndex * (i + 1)) + '\n'
      }
    }
    return sliceText
  }

  parseLabelText (text) {
    const { minWidth } = this.props
    let sliceText
    const pointWidth = this.parsePointWidth()
    const textLen = text.length
    for (let i = textLen; i >= 0; i--) {
      const sliceWidth = this.measureLabelWidth(text.slice(0, i))
      if (sliceWidth + pointWidth <= minWidth) {
        sliceText = text.slice(0, i) + '...'
        break
      }
    }
    return sliceText
  }

  parseRes (text) {
    const {
      minWidth,
      padding
    } = this.props
    const width = this.parseLabelWidth(text)
    return {
      ...this.props,
      width: width,
      label: width > minWidth ? this.parseLabelText(text) : text,
      padding: width > minWidth ? [padding / 2 + this.parsePointWidth(), padding / 2] : [padding / 2, padding / 2]
    }
  }
}

class Preset {
  constructor (data, _nodesBFC = nodesBFC, defaultStyle = dStyle) {
    this.parseLabelFun = new ParseLabel(_nodesBFC)
    this.defaultStyle = defaultStyle
    this.graphData = {
      nodes: '',
      edges: ''
    }
    this.repository = new Map()
    this.data = cloneDeep(data)
    this._nodeMap = {
      id: 'id',
      label: '_label',
      type: '_type'
    }

    this.setColorMap = (colorMap) => {
      this.colorMap = colorMap
      return this
    }

    this.setGroupMap = (groupMap) => {
      this.groupMap = groupMap
      return this
    }

    this.setNodeMap = (nodeMap) => {
      const { _nodeMap } = this
      const tempNodeMap = {}
      for (const prop in _nodeMap) {
        tempNodeMap[_nodeMap[prop]] = nodeMap[prop]
      }
      this.nodeMap = tempNodeMap
      return this
    }

    this.setEdgeMap = (edgeMap) => {
      this.edgeMap = edgeMap
      return this
    }

    this.presetCheck = () => {
      const {
        groupMap,
        data,
        repository
      } = this
      for (const key in groupMap) {
        this.graphData[key] = cloneDeep(data[groupMap[key]])
        const Key = key.replace(/\w{1}$/, '')
        repository.set(key, !!this[`${Key}Map`])
      }
      console.log('repository', repository)
    }

    this.isNull = (item) => {
      for (const prop in item) {
        if (item[prop] !== null) {
          return false
        }
      }
      return true
    }

    this.presetData = (type = 'rect') => {
      this.presetCheck()
      const { repository } = this
      for (const [key, value] of repository) {
        const Key = `${key[0].toUpperCase()}${key.slice(1)}`
        console.log('Key', Key)
        console.log('value', value)
        if (value) {
          this.presetElement(key, type)
        } else {
          console.warn(`%c"${key}%c" can't found  ${Key}Map;Check it and ensure it's right.`, 'font-size: 20px; color: red;', '')
        }
      }
      return this.graphData
    }

    this.loopData = (data, keyMap, sideEffect) => {
      const { loopValues } = this
      const res = []
      for (let item of data) {
        item = loopValues(item, keyMap, sideEffect)
        if (item !== false) {
          res.push(item)
        }
      }
      return res
    }

    this.loopValues = (item, keyMap, sideEffect) => {
      console.log('item', item)
      console.log('keyMap', keyMap)
      const { isNull } = this
      if (isNull(item)) return false
      for (const key in keyMap) {
        const value = keyMap[key]
        let temp = item
        const keys = value.split('.')
        while (keys.length) {
          temp = temp[keys.shift()]
        }
        item[key] = temp
        if (temp === null) {
          console.warn(`value${keys} is null`)
        }
      }
      sideEffect && sideEffect(item)
      return item
    }

    this.presetRectEdgesStyle = (item) => {
      const { defaultStyle } = this
      if (item.type) {
        item._type = item.type
        delete item.type
      }
      item.type = 'graphin-rect-line'
      let edgeStyle = {
        label: {
          value: item._type
        }
      }
      const mixStyle = {
        defaultEdgeStyle: cloneDeep(defaultStyle.defaultEdgeStyle),
        defaultEdgeStatusStyle: cloneDeep(defaultStyle.defaultEdgeStatusStyle)
      }
      edgeStyle = deepMix(mixStyle, edgeStyle)

      const {
        style,
        ...othersttrs
      } = edgeStyle.defaultEdgeStyle
      return {
        ...othersttrs,
        ...style,
        ...edgeStyle.defaultEdgeStatusStyle
      }
    }

    this.presetRectNodesStyle = (item) => {
      const {
        parseLabelFun,
        colorMap,
        defaultStyle
      } = this
      const {
        _label,
        _type
      } = item
      const {
        width,
        height,
        minWidth,
        label,
        padding
      } = parseLabelFun.parseRes(_label)
      item.size = [width, height]
      item.type = 'graphin-rect'
      item.padding = padding
      item.minWidth = minWidth
      item.width = width
      item.height = height

      const fill = colorMap[_type]
      const mixStyle = {
        defaultNodeStyle: cloneDeep(defaultStyle.defaultNodeStyle),
        defaultNodeStatusStyle: cloneDeep(defaultStyle.defaultNodeStatusStyle)
      }
      let lebelStyle = {
        defaultNodeStyle: {
          style: {
            label: {
              value: label
            },
            keyshape: {
              width: width,
              fill: fill,
              stroke: fill
            },
            leftShape: {
              fill: fill,
              stroke: fill
            }
          }
        },
        defaultNodeStatusStyle: {
          status: {
            selected: {
              halo: {},
              keyshape: {
                stroke: fill,
                fill: fill
              },
              label: {},
              leftShape: {}
            },
            active: {
              halo: {
                width: width + 15
              },
              keyshape: {
                fill: fill
              }
            },
            inactive: {}
          }
        }
      }
      lebelStyle = deepMix(mixStyle, lebelStyle)
      const {
        style,
        ...othersttrs
      } = lebelStyle.defaultNodeStyle
      item.style = {
        ...othersttrs,
        ...style,
        ...lebelStyle.defaultNodeStatusStyle
      }
    }

    this.presetElement = (elementType = 'nodes', elementShape = 'rect') => {
      const {
        loopData,
        graphData
      } = this
      const elementMap = this[`${elementType.replace(/s/, '')}Map`]
      let elements = graphData[elementType]
      let sideEffect
      if (elements) {
        sideEffect = (item) => {
          elementShape = elementShape[0].toUpperCase() + elementShape.slice(1)
          elementType = elementType[0].toUpperCase() + elementType.slice(1)
          const presetStyle = `preset${elementShape}${elementType}Style`
          this[presetStyle](item)
        }
        this.graphData[elementType] = elements = loopData(elements, elementMap, sideEffect)
      }
      return elements
    }
    this.presetCircleNodesStyle = (item) => {
      const {
        parseLabelFun,
        colorMap
      } = this
      item.type = 'graphin-circle'
      const {
        _label: label,
        _type: type
      } = item

      const fill = colorMap[type]
      item.style = {
        label: {
          value: parseLabelFun.parseWraps(label, 125),
          offset: [0, 12]
        },
        keyshape: {
          size: 60,
          fillOpacity: 0.2,
          fill: fill,
          stroke: fill
        },
        icon: {
          type: 'font',
          fontFamily: 'graphin',
          value: icons.user,
          size: 30,
          fill: fill
        }

      }
    }

    this.presetCircleEdgesStyle = () => {

    }
    this.rect = () => {
      return this.presetData('rect')
    }
    this.circle = () => {
      return this.presetData('circle')
    }
  }
}

const preset = (data) => {
  return new Preset(data)
}

export default preset
