import { reactive } from 'vue'

export default function useOptions (value) {
  const data = reactive({
    options: [] || value
  })

  function setOptions (value) {
    data.options = value
  }

  return [data, setOptions]
}
