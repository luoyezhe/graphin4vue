import { useContext } from '../Provide'
import { watchEffect } from 'vue'

const useBehaviorHook = (params) => {
  return {
    props: {
      disabled: {
        type: Boolean,
        default: false
      }
    },
    setup (props, context) {
      const { graph } = useContext()
      const {
        type,
        defaultConfig,
        mode = 'default'
      } = params
      const { disabled } = props
      const { ...otherConfig } = context.attrs
      watchEffect((onInvalidate) => {
        /** 保持单例 */
        graph.removeBehaviors(type, mode)
        if (disabled) {
          return
        }
        graph.addBehaviors({
          type,
          ...defaultConfig,
          ...otherConfig
        }, mode)
        onInvalidate(() => {
          if (!graph.destroyed) {
            graph.removeBehaviors(type, mode)
          }
        })
      })
      return () => null
    }
  }
}
const useChangeBehaviorHook = (params) => {
  return {
    props: {
      disabled: {
        type: Boolean,
        default: false
      }
    },
    setup (props, context) {
      const { graph } = useContext()
      const {
        type,
        defaultConfig,
        mode = 'default'
      } = params
      const { ...otherConfig } = context.attrs
      watchEffect((onInvalidate) => {
        /** 保持单例 */
        graph.removeBehaviors(type, mode)
        const { disabled } = props
        if (disabled) {
          return
        }
        graph.addBehaviors({
          type,
          ...defaultConfig,
          ...otherConfig
        }, mode)
        onInvalidate(() => {
          if (!graph.destroyed) {
            graph.removeBehaviors(type, mode)
          }
        })
      })
      return () => null
    }
  }
}

export default useBehaviorHook
export { useChangeBehaviorHook }
