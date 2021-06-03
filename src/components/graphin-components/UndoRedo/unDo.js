import { useContext } from '@graphin'
import cloneDeep from 'lodash-es/cloneDeep'
import { watchEffect, ref } from 'vue'
import isEqual from '@antv/util/lib/is-equal'

const Undo = {
  setup (...arg) {
    const orgMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    let zoomData = {
      before: orgMatrix,
      after: orgMatrix
    }
    let translateData = {
      before: orgMatrix,
      after: orgMatrix
    }
    const selectData = {
      before: '',
      after: ''
    }
    const redoDom = ref(null)
    const context = arg[1]
    const { graph } = useContext()

    watchEffect((onInvalidate) => {
      const stackFun = (evt) => {
        const undoDom = context.refs.undoDom
        if (!undoDom) {
          return
        }
        const { undoStack } = evt
        const undoStackLen = undoStack.length
        // undo 不可用
        if (undoStackLen === 1) {
          undoDom.setAttribute('style', 'cursor: not-allowed')
        } else {
          undoDom.removeAttribute('style')
        }
      }
      graph.on('stackchange', stackFun)

      const dragFun = () => {
        const matrix = graph.get('group').getMatrix()
        if (!matrix) return
        translateData.before = translateData.after
        translateData.after = matrix
        graph.pushStack('translate', translateData)
      }
      graph.on('dragend', dragFun)

      const nodeselectchange = (evt) => {
        const nodes = evt.selectedItems.nodes
        const nodesLength = nodes.length
        if (nodesLength >= 2) {
          selectData.after = nodes.map((item) => {
            return item.getModel().id
          })
          graph.pushStack('selected', selectData)
        }
      }
      graph.on('nodeselectchange', nodeselectchange)

      const viewportchangeFun = (evt) => {
        if (evt.action === 'zoom') {
          const matrix = graph.get('group').getMatrix()
          zoomData.before = zoomData.after
          zoomData.after = matrix
          graph.pushStack('zoom', zoomData)
        }
      }
      graph.on('viewportchange', viewportchangeFun)

      onInvalidate(() => {
        graph.off('dragend', dragFun)
        graph.off('stackchange', stackFun)
        graph.off('viewportchange', viewportchangeFun)
        graph.off('nodeselectchange', nodeselectchange)
      })
    })
    const undo = () => {
      const undoStack = graph.getUndoStack()
      if (!undoStack || undoStack.length === 1) {
        return
      }
      const currentData = undoStack.pop()
      if (currentData) {
        const { action } = currentData
        graph.pushStack(action, cloneDeep(currentData.data), 'redo')

        let data = currentData.data.before
        if (action === 'add' || action === 'selected') {
          data = currentData.data.after
        }
        if (!data) return

        switch (action) {
          case 'zoom':
            graph.get('group').setMatrix(data)
            if (isEqual(data, orgMatrix)) {
              zoomData = {
                before: orgMatrix,
                after: orgMatrix
              }
            }
            break
          case 'translate':
            graph.get('group').setMatrix(data)
            if (isEqual(data, orgMatrix)) {
              translateData = {
                before: orgMatrix,
                after: orgMatrix
              }
            }
            break
          case 'selected':
            data.forEach((item) => {
              graph.clearItemStates(item, 'selected')
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
          case 'delete': {
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
          case 'add':
            Object.keys(data).forEach((key) => {
              const array = data[key]
              if (!array) return
              array.forEach((model) => {
                graph.removeItem(model.id, false)
              })
            })
            break
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
    return () => {
      let children = context.slots.default
      children = children ? children() : '撤销'
      return <div onClick={undo} ref={redoDom.value}>{children}</div>
    }
  }
}

export default Undo
