/**
 * https://github.com/misund/hex-to-rgba/blob/master/src/index.js
 */
const removeHash = (hex) => (hex.charAt(0) === '#' ? hex.slice(1) : hex)
const parseHex = (nakedHex) => {
  const isShort = nakedHex.length === 3 || nakedHex.length === 4
  const twoDigitHexR = isShort ? `${nakedHex.slice(0, 1)}${nakedHex.slice(0, 1)}` : nakedHex.slice(0, 2)
  const twoDigitHexG = isShort ? `${nakedHex.slice(1, 2)}${nakedHex.slice(1, 2)}` : nakedHex.slice(2, 4)
  const twoDigitHexB = isShort ? `${nakedHex.slice(2, 3)}${nakedHex.slice(2, 3)}` : nakedHex.slice(4, 6)
  const twoDigitHexA = (isShort ? `${nakedHex.slice(3, 4)}${nakedHex.slice(3, 4)}` : nakedHex.slice(6, 8)) || 'ff'
  // const numericA = +((parseInt(a, 16) / 255).toFixed(2));
  return {
    r: twoDigitHexR,
    g: twoDigitHexG,
    b: twoDigitHexB,
    a: twoDigitHexA
  }
}
const hexToDecimal = (hex) => parseInt(hex, 16)
const hexesToDecimals = ({
  r,
  g,
  b,
  a
}) => ({
  r: hexToDecimal(r),
  g: hexToDecimal(g),
  b: hexToDecimal(b),
  a: +(hexToDecimal(a) / 255).toFixed(2)
})
const isNumeric = (n) => !isNaN(parseFloat(String(n))) && isFinite(Number(n)) // eslint-disable-line no-restricted-globals, max-len
const formatRgb = (decimalObject, parameterA) => {
  const {
    r,
    g,
    b,
    a: parsedA
  } = decimalObject
  const a = isNumeric(parameterA) ? parameterA : parsedA
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
/**
 * Turns an old-fashioned css hex color value into a rgb color value.
 *
 * If you specify an alpha value, you'll get a rgba() value instead.
 *
 * @param The hex value to convert. ('123456'. '#123456', ''123', '#123')
 * @param An alpha value to apply. (optional) ('0.5', '0.25')
 * @return An rgb or rgba value. ('rgb(11, 22, 33)'. 'rgba(11, 22, 33, 0.5)')
 */
const hexToRgba = (hex, a) => {
  const hashlessHex = removeHash(hex)
  const hexObject = parseHex(hashlessHex)
  const decimalObject = hexesToDecimals(hexObject)
  return formatRgb(decimalObject, a)
}
/**
 *
 * @param hex
 * @param a 透明度，默认是1
 * @returns hex string
 */
export const hexToRgbaToHex = (hex, a = 1) => {
  const hashlessHex = removeHash(hex)
  const hexObject = parseHex(hashlessHex)
  const decimalObject = hexesToDecimals(hexObject)
  const {
    r,
    g,
    b
  } = decimalObject
  let R = r.toString(16)
  let G = g.toString(16)
  let B = b.toString(16)
  let A = Math.round(Number(a) * 255).toString(16)
  if (R.length === 1) {
    R = `0${R}`
  }
  if (G.length === 1) {
    G = `0${G}`
  }
  if (B.length === 1) {
    B = `0${B}`
  }
  if (A.length === 1) {
    A = `0${A}`
  }
  return `#${R}${G}${B}${A}`
}
export default hexToRgba
