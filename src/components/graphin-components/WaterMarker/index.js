import { useContext } from '@graphin'
import { watchEffect } from 'vue'

const WaterMarker = {
  props: {
    options: {
      type: Object,
      default () {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    }

  },
  setup (props) {
    const { graph } = useContext()
    watchEffect(() => {
      const {
        disabled,
        text
      } = props
      if (disabled || !text) return
      graph.setTextWaterMarker([text])
    })
    return () => null
  }
}
export default WaterMarker
