import G6 from '@antv/g6'
import { deepMix } from '@antv/util'
import { setStatusStyle } from './utils'

export var EnumNodeAndEdgeStatus
(function (EnumNodeAndEdgeStatus) {
  EnumNodeAndEdgeStatus.NORMAL = 'normal'
  EnumNodeAndEdgeStatus.SELECTED = 'selected'
  EnumNodeAndEdgeStatus.HOVERED = 'hovered'
  EnumNodeAndEdgeStatus.DISABLED = 'disabled'
})(EnumNodeAndEdgeStatus || (EnumNodeAndEdgeStatus = {}))

export function removeDumpAttrs (attrs) {
  Object.keys(attrs).forEach(key => {
    if (attrs[key] === undefined) {
      delete attrs[key]
    }
  })
  return attrs
}

export function parseLabel (json) {
  const {
    value,
    ...others
  } = json
  const attrs = {
    id: 'label',
    text: value,
    ...others
  }
  return removeDumpAttrs(attrs)
}

export function parseKeyShape (json, model) {
  const { ...others } = json
  const { keyshape } = model.style
  const {
    source,
    target
  } = model
  const isLoop = keyshape?.type === 'loop' || source === target

  const d = json.lineWidth + 5
  const attrs = {
    id: 'keyshape',
    endArrow: isLoop
      ? undefined
      : {
        d: 0,
        path: `M 0,0 L ${d},${d / 2} L ${d},-${d / 2} Z`,
        fill: json.stroke
      },
    ...others
  }
  return removeDumpAttrs(attrs)
}

export function parseHalo (json) {
  const { ...others } = json
  const attrs = {
    id: 'halo',
    ...others
  }
  return removeDumpAttrs(attrs)
}

const parseAttr = (style, itemShapeName, model) => {
  if (itemShapeName === 'keyshape') {
    return parseKeyShape(style.keyshape || {}, model)
  }
  if (itemShapeName === 'halo') {
    return parseHalo(style.halo || {})
  }
  if (itemShapeName === 'label') {
    return parseLabel(style.label || {})
  }
  return {}
}

const getPolyEdgeControlPoint = (p1, p2, d) => {
  const pm = {
    x: (p2.x + p1.x) / 2,
    y: (p2.y + p1.y) / 2
  }
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const c = Math.sqrt(dx ** 2 + dy ** 2)
  const y = pm.y - (dx * d) / c || 0
  const x = pm.x + (dy * d) / c || 0
  return {
    x,
    y
  }
}
const processKeyshape = (cfg) => {
  const {
    startPoint = {
      x: 0,
      y: 0
    },
    endPoint = {
      x: 0,
      y: 0
    },
    style: STYLE,
    sourceNode,
    targetNode
  } = cfg
  const style = STYLE
  const { keyshape } = style
  const {
    type = 'line',
    poly = { distance: 0 },
    loop = {}
  } = keyshape
  const source = sourceNode.get('model')
  const target = targetNode.get('model')
  if (type === 'loop' || source.id === target.id) {
    const nodeSize = source.style?.keyshape?.size || 26
    const {
      distance,
      dx,
      rx,
      ry
    } = {
      // ???????????????????????????
      distance: 0,
      // x????????????
      dx: 8,
      rx: undefined,
      ry: undefined,
      ...loop
    }
    const R = nodeSize / 2
    const dy = Math.sqrt(R ** 2 - dx ** 2)
    const RX = rx || R * 2 * 0.5
    const RY = ry || R * 2 * 0.6
    return [
      ['M', startPoint.x - dx, startPoint.y - dy],
      /**
       * A rx ry x-axis-rotation large-arc-flag sweep-flag x y
       * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
       */
      [
        'A',
        RX + distance,
        RY + distance,
        0,
        1,
        1,
        startPoint.x + dx,
        startPoint.y - dy // endPoint.y
      ]
    ]
  }
  if (type === 'poly') {
    const controlPoints = getPolyEdgeControlPoint(startPoint, endPoint, poly?.distance || 0)
    return [
      ['M', startPoint.x, startPoint.y],
      /**
       * ?????????????????????
       */
      ['Q', controlPoints.x, controlPoints.y, endPoint.x, endPoint.y]
    ]
  }
  // ?????????line
  return [
    ['M', startPoint.x, startPoint.y],
    ['L', endPoint.x, endPoint.y]
  ]
}
export default () => {
  G6.registerEdge('graphin-rect-line', {
    draw (cfg, group) {
      const style = deepMix({}, cfg && cfg.style)
      /** ???????????????????????????model??? */
      if (cfg) {
        // eslint-disable-next-line no-underscore-dangle
        cfg._initialStyle = { ...style }
      }
      const {
        startPoint = {
          x: 0,
          y: 0
        },
        endPoint = {
          x: 0,
          y: 0
        },
        sourceNode,
        targetNode
      } = cfg
      const {
        label,
        halo,
        keyshape: keyShapeStyle
      } = style
      /** ??????????????????????????? */
      const source = sourceNode.get('model')
      const target = targetNode.get('model')
      const nodeSize = source.style?.keyshape?.size || 28
      /** ???????????????loop */
      const isLoop = keyShapeStyle?.type === 'loop' || source.id === target.id
      const hasLabel = label.value
      /** ??????poly????????? */
      const isPoly = keyShapeStyle?.type === 'poly'
      const controlPoints = getPolyEdgeControlPoint(startPoint, endPoint, keyShapeStyle?.poly?.distance || 0)
      const lineWidth = keyShapeStyle?.lineWidth || 1
      const d = lineWidth + 5
      const path = processKeyshape(cfg)
      // TODO:????????????
      // const path = [
      //   ['M', startPoint.x, startPoint.y],
      //   ['L', endPoint.x, endPoint.y],
      // ]
      /** ?????? */

      // ???????????????
      function getIntersections (sP, eP, h) {
        const {
          x: x1,
          y: y1
        } = sP
        const {
          x: x2,
          y: y2
        } = eP
        const alpha = Math.atan((y2 - y1) / (x2 - x1))

        const lineA = [{
          x: x1 - h * Math.sin(alpha),
          y: y1 + h * Math.cos(alpha)
        }, {
          x: x2 - h * Math.sin(alpha),
          y: y2 + h * Math.cos(alpha)
        }]

        const lineB = [{
          x: x1 + h * Math.sin(alpha),
          y: y1 - h * Math.cos(alpha)
        }, {
          x: x2 + h * Math.sin(alpha),
          y: y2 - h * Math.cos(alpha)
        }]
        return {
          lineA,
          lineB
        }
      }

      // ???????????????
      function getIntersectionLine (line, Bbox) {
        function getAxis (line, Bbox) {
          const x1 = line[0].x
          const y1 = line[0].y
          const x2 = line[1].x
          const y2 = line[1].y
          const A = y2 - y1
          const B = x1 - x2
          const C = x2 * y1 - x1 * y2
          // Ax + By + C=0
          // y = (-1 * C - A * x) / B
          // x = (-1 * C - B * y) / A;
          const getX = (y) => (-1 * C - B * y) / A
          const getY = (x) => (-1 * C - A * x) / B
          const {
            maxX,
            maxY,
            minX,
            minY
          } = Bbox
          const left = [{
            x: minX - 5,
            y: minY - 5
          }, {
            x: minX - 5,
            y: maxY + 5
          }]
          const right = [{
            x: maxX + 5,
            y: minY - 5
          }, {
            x: maxX + 5,
            y: maxY + 5
          }]

          const top = [{
            x: minX - 5,
            y: minY - 5
          }, {
            x: maxX + 5,
            y: minY - 5
          }]
          const bottom = [{
            x: minX - 5,
            y: maxY + 5
          }, {
            x: maxX + 5,
            y: maxY + 5
          }]

          const xs = [{
            x: minX,
            line: left
          }, {
            x: maxX,
            line: right
          }]
          const ys = [{
            y: minY,
            line: top
          }, {
            y: maxY,
            line: bottom
          }]

          const getDis = (A, B) => {
            const [x1, y1] = A
            const [x2, y2] = B
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
          }

          let min = Number.MAX_VALUE
          let minLine
          for (const prop of xs) {
            const innterval = prop.line.map((item) => {
              return item.y
            })
            const x = prop.x
            const y = getY(x)
            if (y <= innterval[1] && y >= innterval[0]) {
              const dis = getDis([x1, y1], [x, y])
              if (min >= dis) {
                min = dis
                minLine = prop.line
              }
            }
          }
          for (const prop of ys) {
            const innterval = prop.line.map((item) => {
              return item.x
            })
            const y = prop.y
            const x = getX(y)
            if (x <= innterval[1] && x >= innterval[0]) {
              const dis = getDis([x1, y1], [x, y])
              if (min >= dis) {
                min = dis
                minLine = prop.line
              }
            }
          }
          return minLine
        }

        return getAxis(line, Bbox)
      }

      // ?????????????????????
      function segmentsIntr (lineA, lineB) {
        /** 1 ??????????????????, ???????????????. **/
        // ???????????????0 ??????????????????, ?????????
        const [a, b] = lineA
        const [c, d] = lineB
        const denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y)
        if (denominator === 0) {
          return false
        }
        // ????????????????????????????????? (x , y)
        const x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y) +
          (b.y - a.y) * (d.x - c.x) * a.x -
          (d.y - c.y) * (b.x - a.x) * c.x) / denominator
        const y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x) +
          (b.x - a.x) * (d.y - c.y) * a.y -
          (d.x - c.x) * (b.y - a.y) * c.y) / denominator
        return {
          x,
          y
        }
      }

      function getShortestPoints () {
        const {
          lineA,
          lineB
        } = getIntersections(startPoint, endPoint, 5)
        const sBbox = sourceNode.getBBox()
        const eBbox = targetNode.getBBox()
        const lineATopPoint = {
          key: 'lineATopPoint',
          line: lineA
        }
        const lineBtopPoint = {
          key: 'lineBtopPoint',
          line: lineB
        }
        const lineABottomPoint = {
          key: 'lineABottomPoint',
          line: lineA
        }
        const lineBBottomPoint = {
          key: 'lineBBottomPoint',
          line: lineB
        }
        const points = new Map([[lineATopPoint, sBbox], [lineABottomPoint, eBbox], [lineBtopPoint, sBbox], [lineBBottomPoint, eBbox]])
        let paths = []
        for (const [prop, value] of points) {
          const {
            key,
            line
          } = prop
          const nearlyLine = getIntersectionLine(line, value)
          paths.push({
            key: key,
            point: segmentsIntr(line, nearlyLine)
          })
        }
        paths = [[paths[0].point.x, paths[0].point.y], [paths[1].point.x, paths[1].point.y], [endPoint.x, endPoint.y], [paths[3].point.x, paths[3].point.y], [paths[2].point.x, paths[2].point.y], [startPoint.x, startPoint.y]]
        return paths
      }

      const paths = getShortestPoints()

      group.addShape('polygon', {
        attrs: {
          id: 'halo',
          points: paths,
          fill: halo.stroke || keyShapeStyle.stroke
        },
        // must be assigned in G6 3.3 and later versions. it can be any value you want
        draggable: true,
        name: 'halo',
        visible: halo.visible !== false
      })

      /** ????????? */
      const key = group.addShape('path', {
        attrs: {
          id: 'keyshape',
          path,
          endArrow: isLoop
            ? undefined
            : {
              d: 0,
              path: `M 0,0 L ${d},${d / 2} L ${d},-${d / 2} Z`,
              fill: keyShapeStyle.stroke
            },
          ...keyShapeStyle
        },
        draggable: true,
        name: 'keyshape'
      })
      /** ?????? */
      if (hasLabel) {
        const {
          value,
          fontSize = 8,
          offset = [0, 0],
          background,
          ...others
        } = label
        const hasBackground = Boolean(background)
        const [offsetX, offsetY] = offset
        /** ?????????????????????????????????????????? */
        let degree = Math.atan((endPoint.y - startPoint.y) / (endPoint.x - startPoint.x))
        /** ?????????????????????????????????????????? */
        let midPosition = [(startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2]
        if (isPoly) {
          // TODO: ??????label??????????????????????????????????????????, ????????????????????????????????????
          midPosition = [(controlPoints.x + midPosition[0]) / 2, (controlPoints.y + midPosition[1]) / 2]
        }
        if (endPoint.x - startPoint.x === 0) {
          degree = Math.PI / 2
        }
        if (isLoop) {
          degree = 2 * Math.PI
        }
        /** ????????????????????? */
        if (hasBackground) {
          const calcWidth = String(value).length * fontSize * 0.6
          const calcHeight = fontSize * 1.8
          const defaultBackground = {
            fill: '#fff',
            width: calcWidth,
            height: calcHeight,
            stroke: keyShapeStyle.stroke,
            lineWidth: 1,
            radius: 6
          }
          const {
            fill,
            width,
            height,
            stroke,
            ...otherBackgroundAttrs
          } = { ...defaultBackground, ...background }
          const labelBackgroundShape = group.addShape('rect', {
            attrs: {
              id: 'label-background',
              x: -width / 2,
              y: -height / 2,
              width,
              height,
              fill,
              stroke,
              ...otherBackgroundAttrs
            },
            draggable: true,
            name: 'label-background'
          })
          /** ?????????????????????????????? */
          labelBackgroundShape.rotate(degree)
          labelBackgroundShape.translate(midPosition[0], midPosition[1])
        }
        /** ????????????????????? */
        let y = offsetY - fontSize / 2
        if (isLoop) {
          y = offsetY - nodeSize * 1.6 - (keyShapeStyle?.loop?.distance || 0) * 2
        }
        if (hasBackground) {
          y = offsetY + fontSize / 2
        }
        const labelShape = group.addShape('text', {
          attrs: {
            id: 'label',
            x: offsetX,
            y,
            text: value,
            fontSize,
            ...others
          },
          draggable: true,
          name: 'label'
        })
        /** ?????????????????????????????? */
        labelShape.rotate(degree)
        labelShape.translate(midPosition[0], midPosition[1])
      }
      return key
    },
    setState (name, value, item) {
      if (!name) {
        return
      }
      const model = item.getModel()
      const shapes = item.getContainer().get('children') // ???????????? draw ?????????
      const initStateStyle = deepMix({}, model.style.status)
      const initialStyle = item.getModel()._initialStyle
      const status = item._cfg?.states || []
      try {
        Object.keys(initStateStyle).forEach(statusKey => {
          if (name === statusKey) {
            if (value) {
              setStatusStyle(shapes, initStateStyle[statusKey], parseAttr, model) // ?????????status?????????
            } else {
              setStatusStyle(shapes, initialStyle, parseAttr, model) // ?????????????????????
              status.forEach(key => {
                // ??????cfg.status????????????????????????????????????????????????
                setStatusStyle(shapes, initStateStyle[key], parseAttr, model)
              })
            }
          }
        })
      } catch (error) {
        console.error(error)
      }
    }
  })
}
