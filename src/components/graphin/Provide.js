// import { provide, inject, shallowReactive } from '@vue/composition-api'
import { provide, inject, shallowReactive } from 'vue'

const defaultContext = {
  graph: {},
  apis: {},
  theme: {},
  layout: {},
  legend: {}
}
export const contextSymbol = Symbol('contextSymbol')

export const createContext = (context) => {
  provide(contextSymbol, context)
}

export const useContext = () => {
  const context = inject(contextSymbol)
  if (!context) {
    throw new Error('context must be used after useProvide')
  }
  return context
}

export default {
  name: 'Provide',
  props: {
    value: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  setup (props, context) {
    let contextValue = Object.assign(defaultContext, props.value)
    contextValue = shallowReactive(contextValue)
    createContext(contextValue)
    return () => <div>{ context.slots.default() }</div>
  }
}
