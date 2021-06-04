const isDebugMode = true
const floorRandom = (number) => {
  return Math.floor(Math.random() * number)
}
const randomColor = (opacity = 1) => {
  const r = floorRandom(255)
  const g = floorRandom(255)
  const b = floorRandom(255)
  const color = `rgba(${r},${g},${b},${opacity})`
  return color
}
const colorMap = {}
/**
 *
 * @param {*} name 分类的名称
 * @example
 * debug('Tooltip')('render','...')
 * @todo https://developer.mozilla.org/zh-CN/docs/Web/API/Console
 *
 */
const debug = (name) => {
  if (!colorMap[name]) {
    colorMap[name] = randomColor()
  }
  const color = colorMap[name]
  // eslint-disable-next-line
  return (...message) => {
    // eslint-disable-line
    if (isDebugMode && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`%c${name}`, `color:  ${color}; font-style:italic ;padding: 2px;font-weight:700`, ...message)
    }
  }
}
export default debug
