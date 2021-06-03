import G6 from '@antv/g6'
import useBehaviorHook from './useBehaviorHook'
import state from './state/state'

const behaviorsConfig = {
  getDefaultCfg () {
    return {
      trigger: 'mouseenter', // 可选 mouseenter || click
      activeState: 'active',
      inactiveState: 'inactive',
      resetSelected: true,
      shouldUpdate () {
        return true
      }
    }
  },
  getEvents () {
    if ((this).get('trigger') === 'mouseenter') {
      return {
        'node:mouseenter': 'setAllItemStates',
        'combo:mouseenter': 'setAllItemStates',
        'node:mouseleave': 'clearActiveState',
        'combo:mouseleave': 'clearActiveState'
      }
    }
    return {
      'node:click': 'setAllItemStates',
      'combo:click': 'setAllItemStates',
      'canvas:click': 'clearAllItemStates',
      keyup: 'onKeyUp',
      keydown: 'onKeyDown'
    }
  },
  setAllItemStates (e) {
    const self = this
    if (!self.shouldUpdate(e.item, {
      event: e,
      action: 'deactivate'
    })) {
      return
    }
    const {
      setAllItemStates,
      pushSetStack
    } = state
    setAllItemStates.call(self, [e.item])
    pushSetStack.call(self, [e.item])
  },
  clearActiveState (e) {
    const { clearActiveState } = state
    clearActiveState(e)
  },
  clearAllItemStates (e) {
    const self = this
    if (!self.shouldUpdate(e.item, {
      event: e,
      action: 'deactivate'
    })) {
      return
    }
    const {
      clearAllItemStates,
      pushClearStack
    } = state
    clearAllItemStates.call(self, e)
    pushClearStack.call(self, [e.item])
  },
  onKeyDown () {
    const self = this
    self.keydown = true
  },
  onKeyUp () {
    const self = this
    self.keydown = false
  }
}

G6.registerBehavior('select-relations', behaviorsConfig)

const defaultConfig = {
  /**
   * @description 是否禁用该功能
   * @default false
   */
  disabled: false,
  /**
   * @description 可以是 mousenter，表示鼠标移入时触发；也可以是 click，鼠标点击时触发
   * @default mouseenter
   */
  trigger: 'click',
  /**
   * @description 活跃节点状态。当行为被触发，需要被突出显示的节点和边都会附带此状态，默认值为  active；可以与 graph 实例的  nodeStyle  和  edgeStyle  结合实现丰富的视觉效果。
   * @default active
   */
  activeState: 'active',
  /**
   * @description 非活跃节点状态。不需要被突出显示的节点和边都会附带此状态。默认值为  inactive。可以与 graph 实例的  nodeStyle  和  edgeStyle  结合实现丰富的视觉效果；
   * @default inactive
   */
  inactiveState: 'inactive',
  /**
   * @description 高亮相连节点时是否重置已经选中的节点，默认为 false，即选中的节点状态不会被 activate-relations 覆盖；
   * @default false
   */
  resetSelected: true
}
const SelectRelations = useBehaviorHook({
  type: 'select-relations',
  defaultConfig
})

export default SelectRelations
