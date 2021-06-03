import G6 from '@antv/g6'
import { deepMix, isArray, isNumber } from '@antv/util'
import { setStatusStyle, removeDumpAttrs, convertSizeToWH, getLabelXYByPosition, getBadgePosition } from './utils'

function getRadiusBySize (size) {
  let r
  if (isNumber(size)) {
    r = size / 2
  } else if (isArray(size)) {
    r = size[0] / 2
  }
  return r
}

const getStyles = (defaultStyleCfg, cfgStyle) => {
  // const { halo, keyshape } = { ...defaultStyleCfg, ...cfgStyle } as any;
  // const nodeSize = convertSizeToWH(keyshape.size);
  // /*  halo 默认样式单独处理* */
  // const haloStyle = {
  //   halo: {
  //     x: 0,
  //     y: 0,
  //     r: nodeSize[0] / 2 + 17, // 默认 halo的样式和keyshape相关
  //     fill: keyshape.fill,
  //     visible: false,
  //     ...halo,
  //   },
  // };
  return deepMix({}, defaultStyleCfg, cfgStyle)
}
/**
 * @description 解析Halo
 * @param config 用户输入的数据
 */
const parseHalo = (style) => {
  const {
    halo,
    keyshape
  } = style
  const {
    size,
    visible,
    fill,
    fillOpacity,
    ...otherAttrs
  } = halo
  const haloR = getRadiusBySize(size)
  let keyshapeR
  let keyshapeFill
  let keyshapeStroke
  if (keyshape && keyshape.size) {
    const calculateR = getRadiusBySize(keyshape.size)
    keyshapeR = calculateR + 15
  }
  if (keyshape && keyshape.fill) {
    keyshapeFill = keyshape.fill
  }
  if (keyshape && keyshape.stroke) {
    keyshapeStroke = keyshape.stroke
  }
  const attrs = {
    x: 0,
    y: 0,
    r: haloR || keyshapeR,
    fill: fill || keyshapeFill || keyshapeStroke,
    fillOpacity: fillOpacity || 0.1,
    visible: visible !== false,
    ...otherAttrs
  }
  return {
    name: 'halo',
    visible: visible !== false,
    attrs: removeDumpAttrs(attrs)
  }
}
const parseKeyshape = (style) => {
  const { keyshape } = style
  const {
    size,
    visible,
    stroke,
    fill,
    fillOpacity,
    strokeOpacity,
    ...otherAttrs
  } = keyshape
  const r = getRadiusBySize(size)
  const attrs = {
    x: 0,
    y: 0,
    r,
    cursor: 'pointer',
    visible: visible !== false,
    stroke,
    strokeOpacity: strokeOpacity || 1,
    fill: fill || stroke,
    fillOpacity: fillOpacity || 0.2,
    ...otherAttrs
  }
  return {
    name: 'keyshape',
    visible: visible !== false,
    attrs: removeDumpAttrs(attrs)
  }
}
const parseLabel = (style) => {
  const { label } = style
  const {
    value,
    fill,
    fontSize,
    visible,
    ...otherAttrs
  } = label
  const labelPos = getLabelXYByPosition(style)
  const attrs = {
    x: labelPos.x,
    y: labelPos.y,
    fontSize,
    text: value,
    textAlign: 'center',
    fill,
    textBaseline: labelPos.textBaseline,
    visible: visible !== false,
    ...otherAttrs
  }
  return {
    name: 'label',
    visible: visible !== false,
    attrs: removeDumpAttrs(attrs)
  }
}
const parseIcon = (style) => {
  const { icon } = style
  const {
    value = '',
    type,
    fontFamily,
    textAlign = 'center',
    textBaseline = 'middle',
    fill,
    size,
    visible,
    ...otherAttrs
  } = icon
  const [width, height] = convertSizeToWH(size)
  const params = {
    name: 'icon',
    visible: visible !== false,
    capture: false
  }
  if (type === 'text' || type === 'font') {
    return {
      ...params,
      attrs: {
        x: 0,
        y: 0,
        textAlign,
        textBaseline,
        text: value,
        fontSize: width,
        fontFamily,
        fill,
        visible: visible !== false,
        ...otherAttrs
      }
    }
  }
  // image
  return {
    ...params,
    attrs: {
      x: -width / 2,
      y: -height / 2,
      img: value,
      width,
      height,
      visible: visible !== false,
      ...otherAttrs
    }
  }
}
/** 根据用户输入的json，解析成attr */
const parseAttr = (style, itemShapeName) => {
  if (itemShapeName === 'keyshape') {
    return parseKeyshape(style).attrs
  }
  if (itemShapeName === 'halo') {
    return parseHalo(style).attrs
  }
  if (itemShapeName === 'label') {
    return parseLabel(style).attrs
  }
  if (itemShapeName === 'icon') {
    return parseIcon(style).attrs
  }
  return style[itemShapeName] || {}
}
const drawBadge = (badge, group, r) => {
  const {
    type,
    position,
    value: badgeValue = '',
    size: badgeSize,
    fill,
    stroke,
    color,
    fontSize,
    fontFamily,
    padding = 0,
    offset: inputOffset = [0, 0]
  } = badge
  const offset = convertSizeToWH(inputOffset)
  const [width, height] = convertSizeToWH(badgeSize)
  const {
    x: badgeX,
    y: badgeY
  } = getBadgePosition(position, r)
  let realX = badgeX
  let realY = badgeY
  // 绘制 badge 的外层容器，根据宽度和高度确定是 circle 还是 rect
  if (width === height) {
    group.addShape('circle', {
      attrs: {
        r: width / 2 + padding,
        fill,
        stroke,
        x: realX + offset[0],
        y: realY + offset[1]
      },
      name: 'badges-circle'
    })
  } else {
    realX = badgeX - width - padding * 2
    realY = badgeY - height - padding * 2
    if (position === 'LB') {
      realY = badgeY
    } else if (position === 'RT') {
      realX = badgeX
      realY = badgeY - height - padding * 2
    } else if (position === 'RB') {
      realX = badgeX
      realY = badgeY
    }
    realX += offset[0]
    realY += offset[1]
    group.addShape('rect', {
      attrs: {
        width: width + padding * 2,
        height: height + padding * 2,
        fill,
        stroke,
        x: realX,
        y: realY,
        radius: (height + padding * 2) / 3
      },
      name: 'badges-rect'
    })
  }
  if (type === 'font' || type === 'text') {
    group.addShape('text', {
      attrs: {
        x: width !== height ? realX + width / 2 + padding : realX,
        y: width !== height ? realY + height / 2 + padding : realY,
        text: badgeValue,
        fontSize,
        textAlign: 'center',
        textBaseline: 'middle',
        fontFamily,
        fill: color
      },
      capture: false,
      name: 'badges-text'
    })
  } else if (type === 'image') {
    group.addShape('image', {
      attrs: {
        x: realX - width / 2,
        y: realX - height / 2,
        width,
        height,
        img: badgeValue
      },
      capture: false,
      name: 'badges-image'
    })
  }
}
export default () => {
  G6.registerNode('graphin-circle', {
    options: {
      style: {},
      status: {}
    },
    draw (cfg, group) {
      const style = getStyles({}, cfg.style)
      /** 将初始化样式存储在model中 */
      cfg._initialStyle = { ...style }
      const { icon, badges = [], keyshape: keyShapeStyle } = style

      const r = getRadiusBySize(keyShapeStyle.size)

      // halo 光晕
      style.halo && group.addShape('circle', parseHalo(style))

      // keyshape 主容器
      const keyShape = group.addShape('circle', parseKeyshape(style))

      // 文本
      style.label && group.addShape('text', parseLabel(style))

      // keyShape 中间的 icon
      const { type } = icon
      if (type === 'text' || type === 'font') {
        group.addShape('text', parseIcon(style))
      }
      if (type === 'image') {
        group.addShape('image', parseIcon(style))
      }

      // badges 会存在多个的情况
      badges.forEach(badge => {
        drawBadge(badge, group, r)
      })
      return keyShape
    },
    setState (name, value, item) {
      if (!name) {
        return
      }
      const model = item.getModel()
      const shapes = item.getContainer().get('children') // 顺序根据 draw 时确定
      const initStateStyle = deepMix({}, model.style.status)
      const initialStyle = item.getModel()._initialStyle
      const status = item._cfg?.states || []

      try {
        Object.keys(initStateStyle).forEach(statusKey => {
          if (name === statusKey) {
            if (value) {
              setStatusStyle(shapes, initStateStyle[statusKey], parseAttr) // 匹配到status就改变
            } else {
              setStatusStyle(shapes, initialStyle, parseAttr) // 没匹配到就重置
              status.forEach(key => {
                // 如果cfg.status中还有其他状态，那就重新设置回来
                setStatusStyle(shapes, initStateStyle[key], parseAttr)
              })
            }
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    update (cfg, item) {
      if (!cfg.style) {
        return
      }
      try {
        const style = getStyles(cfg._initialStyle, cfg.style)
        cfg._initialStyle = { ...style }
        const { badges, keyshape } = style
        const r = getRadiusBySize(keyshape.size)
        const group = item.getContainer()
        const shapes = group.get('children')
        setStatusStyle(shapes, style, parseAttr)
        const copyShapes = [...shapes]
        if (badges && badges.length > 0) {
          let index = 0
          copyShapes.forEach(shape => {
            if (shape.cfg.name.startsWith('badges')) {
              shapes.splice(index, 1)
            } else {
              index = index + 1
            }
          })
          badges.forEach(badge => {
            drawBadge(badge, group, r)
          })
        }
      } catch (error) {
        console.error('error')
      }
    }
  })
}
