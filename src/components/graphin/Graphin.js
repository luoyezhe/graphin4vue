import G6 from '@antv/g6'
import GraphinVue from './Graphin.vue'

class Graphin {
  static registerBehavior (behaviorName, behavior) {
    G6.registerBehavior(behaviorName, behavior)
  }

  static registerFontFamily (iconLoader) {
    /**  注册 font icon */
    const iconFont = iconLoader()
    const {
      glyphs,
      fontFamily
    } = iconFont
    const icons = glyphs.map(item => {
      return {
        name: item.name,
        unicode: String.fromCodePoint(item.unicode_decimal)
      }
    })
    return new Proxy(icons, {
      get: (target, propKey) => {
        const matchIcon = target.find(icon => {
          return icon.name === propKey
        })
        if (!matchIcon) {
          console.error(`%c fontFamily:${fontFamily},does not found ${propKey} icon`)
          return ''
        }
        return matchIcon?.unicode
      }
    })
  }

  static registerLayout (layoutName, layout) {
    G6.registerLayout(layoutName, layout)
  }
}

Graphin.registerNode = (nodeName, options, extendedNodeName) => {
  G6.registerNode(nodeName, options, extendedNodeName)
}
Graphin.registerEdge = (edgeName, options, extendedEdgeName) => {
  G6.registerEdge(edgeName, options, extendedEdgeName)
}
Graphin.registerCombo = (comboName, options, extendedComboName) => {
  G6.registerCombo(comboName, options, extendedComboName)
}

Graphin.install = (Vue) => {
  Vue.component('Graphin', GraphinVue)
}
export default Graphin
