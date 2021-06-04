import { watchEffect } from 'vue'
import { useContext, G6 } from '@graphin'

const defaultOptions = {
  r: 249,
  scaleRByWheel: true,
  minR: 100,
  maxR: 500,
  /**
   * @description 放大镜样式
   */
  delegateStyle: {
    stroke: '#000',
    strokeOpacity: 0.8,
    lineWidth: 2,
    fillOpacity: 0.1,
    fill: '#ccc'
  },
  showLabel: false
}
const FishEye = {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default () {
        return {}
      }
    },
    handleEscListener: {
      type: Function
    }
  },
  setup (props) {
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const {
        options,
        visible,
        handleEscListener
      } = props
      const FishEyeOptions = {
        ...defaultOptions,
        ...options
      }
      if (FishEyeOptions.showLabel) {
        // 先将图上的label全部隐藏
        graph.getNodes().forEach((node) => {
          node
            .getContainer()
            .getChildren()
            .forEach((shape) => {
              if (shape.get('type') === 'text') {
                shape.hide()
              }
            })
        })
      }
      const fishEye = new G6.Fisheye(FishEyeOptions)
      const escListener = (e) => {
        if (e.keyCode === 27) {
          if (handleEscListener) {
            handleEscListener()
            graph.get('canvas').setCursor('default')
          }
        }
      }
      if (visible) {
        graph.addPlugin(fishEye)
        graph.add = true
        graph.get('canvas').setCursor('zoom-in')
      }
      if (handleEscListener) {
        window.addEventListener('keydown', escListener)
      }

      onInvalidate(() => {
        graph.get('canvas').setCursor('default')
        graph.removePlugin(fishEye)
        if (handleEscListener) {
          window.removeEventListener('keydown', escListener)
        }
      })
    })
    return () => null
  }
}

export default FishEye
