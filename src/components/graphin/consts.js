export const DEFAULT_TREE_LAYOUT_OPTIONS = {
  type: 'compactBox',
  direction: 'LR',
  getId: function getId (d) {
    return d.id
  },
  getHeight: function getHeight () {
    return 16
  },
  getWidth: function getWidth () {
    return 16
  },
  getVGap: function getVGap () {
    return 80
  },
  getHGap: function getHGap () {
    return 20
  }
}
export const TREE_LAYOUTS = ['dendrogram', 'compactBox', 'mindmap', 'indented']
