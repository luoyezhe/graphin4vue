import { reactive } from 'vue'

export default function useState (value) {
  const state = reactive(value ?? {
    visible: false,
    x: 0,
    y: 0,
    item: null
  })

  function setState (value) {
    for (const prop in value) {
      state[prop] = value[prop]
    }
  }

  return [state, setState]
}
