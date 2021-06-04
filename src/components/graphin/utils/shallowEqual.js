const shallowEqual = (prev, current) => {
  let isEqual = true
  const prevKeys = Object.keys(prev)
  const currentKeys = Object.keys(current)
  if (prevKeys.length !== currentKeys.length) {
    return false
  }
  for (let i = 0; i < prevKeys.length; i++) {
    const key = prevKeys[i]
    if (prev[key] !== current[key]) {
      isEqual = false
      break
    }
  }
  return isEqual
}
export default shallowEqual
