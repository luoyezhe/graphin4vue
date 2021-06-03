import { reactive } from 'vue'

export default function useState () {
  const state = reactive({
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
