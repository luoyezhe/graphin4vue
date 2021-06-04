import { useContext } from '@graphin'
import { watchEffect } from 'vue'

const defaultHullCfg = {
  /** 包裹的id */
  id: `${Math.random()}`,
  /** 在包裹内部的节点实例或节点 ID 数组 */
  members: [],
  /**
   * 包裹的类型
   * round-convex: 生成圆角凸包轮廓
   * smooth-convex: 生成平滑凸包轮廓
   * bubble：产生一种可以避开 nonMembers 的平滑凹包轮廓（算法）。
   * 默认值是 round-convex */
  type: 'round-convex',
  /** 不在轮廓内部的节点数组，只在 bubble 类型的包裹中生效  */
  nonMembers: [],
  /** 轮廓的样式属性 */
  style: {
    /** 填充颜色 */
    fill: 'lightblue',
    /** 描边颜色 */
    stroke: 'blue',
    /** 透明度 */
    opacity: 0.2
  },
  /** 轮廓边缘和内部成员的间距 */
  padding: 10
}
/**
 * deep merge hull config
 * @param defaultCfg
 * @param cfg
 */
const deepMergeCfg = (defaultCfg, cfg) => {
  const { style: DefaultCfg = {}, ...defaultOtherCfg } = defaultCfg
  const { style = {}, ...others } = cfg
  return {
    ...defaultOtherCfg,
    ...others,
    style: {
      ...DefaultCfg,
      ...style
    }
  }
}
let hullInstances
const Hull = {
  props: {
    options: {
      type: Array,
      default () {
        return []
      }
    }
  },
  setup (props) {
    const { options } = props
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const handleAfterUpdateItem = () => {
        hullInstances.forEach((item) => {
          item.updateData(item.members)
        })
      }
      const handleAfterLayout = () => {
        hullInstances = options.map((item) => {
          return graph.createHull(deepMergeCfg(defaultHullCfg, item))
        })
      }
      graph.on('afterupdateitem', handleAfterUpdateItem)
      graph.on('afterlayout', handleAfterLayout)
      onInvalidate(() => {
        graph.on('afterlayout', handleAfterLayout)
        graph.on('afterupdateitem', handleAfterUpdateItem)
      })
    })
    return () => <div class="graphin-hull-container"></div>
  }
}
export default Hull
