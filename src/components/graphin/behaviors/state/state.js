const stackData = {
  before: '',
  after: ''
}

const state = {
  type: '',
  items: ''
}

class State {
  constructor (graph, activeState = 'active', inactiveState = 'inactive') {
    this.graph = graph
    this.activeState = activeState
    this.inactiveState = inactiveState

    this.setAllItemStates = function (items, type = 'default') {
      if (this.keydown) return
      const graph = this.graph
      const self = this
      const activeState = this.activeState
      const inactiveState = this.inactiveState
      const nodes = graph.getNodes()
      const combos = graph.getCombos()
      const edges = graph.getEdges()
      const vEdges = graph.get('vedges')
      const nodeLength = nodes.length
      const comboLength = combos.length
      const edgeLength = edges.length
      const vEdgeLength = vEdges.length
      for (let i = 0; i < nodeLength; i++) {
        const node = nodes[i]
        const hasSelected = node.hasState('selected')
        if (items.some((item) => {
          return item === node
        })) {
          continue
        }
        if (self.resetSelected) {
          if (hasSelected) {
            graph.setItemState(node, 'selected', false)
          }
        }
        graph.setItemState(node, activeState, false)

        if (inactiveState) {
          graph.setItemState(node, inactiveState, true)
        }
      }
      for (let i = 0; i < comboLength; i++) {
        const combo = combos[i]
        const hasSelected = combo.hasState('selected')
        if (self.resetSelected) {
          if (hasSelected) {
            graph.setItemState(combo, 'selected', false)
          }
        }
        graph.setItemState(combo, activeState, false)
        if (inactiveState) {
          graph.setItemState(combo, inactiveState, true)
        }
      }

      for (let i = 0; i < edgeLength; i++) {
        const edge = edges[i]
        graph.setItemState(edge, activeState, false)
        if (inactiveState) {
          graph.setItemState(edge, inactiveState, true)
        }
      }

      for (let i = 0; i < vEdgeLength; i++) {
        const vEdge = vEdges[i]
        graph.setItemState(vEdge, activeState, false)
        if (inactiveState) {
          graph.setItemState(vEdge, inactiveState, true)
        }
      }

      if (inactiveState) {
        for (const item of items) {
          graph.setItemState(item, inactiveState, false)
        }
      }

      for (const item of items) {
        const rEdges = item.getEdges()
        const rEdgeLegnth = rEdges.length
        for (let i = 0; i < rEdgeLegnth; i++) {
          const edge = rEdges[i]
          let otherEnd
          switch (type) {
            case 'target':
              if (edge.getSource() === item) {
                otherEnd = edge.getTarget()
              }
              break
            case 'source':
              if (edge.getTarget() === item) {
                otherEnd = edge.getSource()
              }
              break
            default:
              if (edge.getSource() === item) {
                otherEnd = edge.getTarget()
              } else {
                otherEnd = edge.getSource()
              }
          }
          if (inactiveState && otherEnd) {
            graph.setItemState(otherEnd, inactiveState, false)
          }

          graph.setItemState(edge, inactiveState, false)
          if (otherEnd) {
            graph.setItemState(otherEnd, activeState, true)
            graph.setItemState(edge, activeState, true)
            edge.toFront()
          }
        }
      }
    }

    this.clearActiveState = function (e) {
      const self = this
      const graph = self.get('graph')
      if (!self.shouldUpdate(e.item, {
        event: e,
        action: 'deactivate'
      })) {
        return
      }
      const activeState = this.activeState
      const inactiveState = this.inactiveState

      const autoPaint = graph.get('autoPaint')
      graph.setAutoPaint(false)
      const nodes = graph.getNodes()
      const combos = graph.getCombos()
      const edges = graph.getEdges()
      const vEdges = graph.get('vedges')
      const nodeLength = nodes.length
      const comboLength = combos.length
      const edgeLength = edges.length
      const vEdgeLength = vEdges.length

      for (let i = 0; i < nodeLength; i++) {
        const node = nodes[i]
        graph.clearItemStates(node, [activeState, inactiveState])
      }
      for (let i = 0; i < comboLength; i++) {
        const combo = combos[i]
        graph.clearItemStates(combo, [activeState, inactiveState])
      }
      for (let i = 0; i < edgeLength; i++) {
        const edge = edges[i]
        graph.clearItemStates(edge, [activeState, inactiveState, 'deactivate'])
      }
      for (let i = 0; i < vEdgeLength; i++) {
        const vEdge = vEdges[i]
        graph.clearItemStates(vEdge, [activeState, inactiveState, 'deactivate'])
      }
      graph.paint()
      graph.setAutoPaint(autoPaint)
    }

    this.clearAllItemStates = function () {
      const self = this
      const graph = self.graph
      const activeState = this.activeState
      const inactiveState = this.inactiveState
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      const nodeLength = nodes.length
      const edgeLength = edges.length

      for (let i = 0; i < nodeLength; i++) {
        const node = nodes[i]
        graph.clearItemStates(node, [activeState, inactiveState])
      }
      for (let i = 0; i < edgeLength; i++) {
        const edge = edges[i]
        graph.clearItemStates(edge, [activeState, inactiveState, 'deactivate'])
      }
    }
    const {
      setAllItemStates,
      clearAllItemStates
    } = this

    this.pushSetStack = function (items, type) {
      if (this.keydown) return
      const _this = this
      const { graph } = this
      if (!stackData.before) {
        stackData.before = function () {
          for (const item of items) {
            graph.setItemState(item, 'selected', false)
          }
          clearAllItemStates.call(_this)
          stackData.before = ''
        }
      } else {
        stackData.before = stackData.after
      }

      stackData.after = function () {
        for (const item of items) {
          graph.setItemState(item, 'selected', true)
        }
        setAllItemStates.call(_this, items, type)
      }
      state.type = type
      state.items = items
      graph.pushStack('groupRelation', stackData)
    }

    this.pushClearStack = function () {
      const _this = this
      const { graph } = this
      stackData.before = function () {
        const {
          type,
          items
        } = state
        setAllItemStates.call(_this, items, type)
      }
      stackData.after = function () {
        clearAllItemStates.call(_this)
      }
      graph.pushStack('groupRelation', stackData)
    }
  }
}

const setStateInstance = new State()

export default setStateInstance
