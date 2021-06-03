import { useContext } from '@graphin'
import { watchEffect, ref } from 'vue'
import cloneDeep from 'lodash-es/cloneDeep'

const Redo = {
  setup (...arg) {
    const redoDom = ref(null)
    const context = arg[1]
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const stackFun = (evt) => {
        const redoDom = context.refs.redoDom
        if (!redoDom) {
          return
        }
        const { redoStack } = evt
        const redoStackLen = redoStack.length

        // redo 不可用
        if (redoStackLen === 0) {
          redoDom.setAttribute('style', 'cursor: not-allowed')
        } else {
          redoDom.removeAttribute('style')
        }
      }
      graph.on('stackchange', stackFun)
      onInvalidate(() => {
        graph.off('stackchange', stackFun)
      })
    })
    const redo = () => {
      const redoStack = graph.getRedoStack()
      if (!redoStack || redoStack.length === 0) {
        return
      }
      const currentData = redoStack.pop()
      if (currentData) {
        const { action } = currentData
        let data = currentData.data.after
        graph.pushStack(action, cloneDeep(currentData.data))
        if (action === 'delete') {
          data = currentData.data.before
        }

        if (!data) return
        switch (action) {
          case 'zoom':
            graph.get('group').setMatrix(data)
            break
          case 'translate':
            graph.get('group').setMatrix(data)
            break
          case 'selected':
            data.forEach((item) => {
              graph.setItemStates(item, 'selected')
            })
            break
          case 'groupRelation':
            data()
            break
          case 'groupUpdate':
            data.forEach(model => {
              graph.updateItem(model.id, model, false)
            })
            break
          case 'visible': {
            Object.keys(data).forEach((key) => {
              const array = data[key]
              if (!array) return
              array.forEach((model) => {
                const item = graph.findById(model.id)
                if (model.visible) {
                  graph.showItem(item, false)
                } else {
                  graph.hideItem(item, false)
                }
              })
            })
            break
          }
          case 'render':
          case 'update':
            Object.keys(data).forEach((key) => {
              const array = data[key]
              if (!array) return
              array.forEach((model) => {
                graph.updateItem(model.id, model, false)
              })
            })
            break
          case 'changedata':
            graph.changeData(data, false)
            break
          case 'delete':
            if (data.edges) {
              data.edges.forEach((model) => {
                graph.removeItem(model.id, false)
              })
            }
            if (data.nodes) {
              data.nodes.forEach((model) => {
                graph.removeItem(model.id, false)
              })
            }
            if (data.combos) {
              data.combos.forEach((model) => {
                graph.removeItem(model.id, false)
              })
            }
            break
          case 'add': {
            Object.keys(data).forEach((key) => {
              const array = data[key]
              if (!array) return
              array.forEach((model) => {
                const itemType = model.itemType
                delete model.itemType
                graph.addItem(itemType, model, false)
              })
            })
            break
          }
          case 'updateComboTree':
            Object.keys(data).forEach((key) => {
              const array = data[key]
              if (!array) return
              array.forEach((model) => {
                graph.updateComboTree(model.id, model.parentId, false)
              })
            })
            break
          default:
        }
      }
    }
    const children = context.slots.default ?? '重做'
    return () => <div onClick={redo} ref={redoDom.value}>{children}</div>
  }
}

export default Redo
