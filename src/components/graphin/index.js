import Graphin from './Graphin'
import Utils from './utils'
import Behaviors from './behaviors'
import { useContext } from './Provide'

import registerGraphinForce from './layout/inner/registerGraphinForce'
import registerPresetLayout from './layout/inner/registerPresetLayout'
import { registerGraphinCircle, registerGraphinLine, registerGraphinRect, registerGraphinRectLine } from './shape'
/** 注册 Graphin force 布局 */
registerGraphinForce()
/** 注册 Graphin preset 布局 */
registerPresetLayout()
/** 注册 Graphin Circle Node */
registerGraphinCircle()
/** 注册 Graphin Rect Node */
registerGraphinRect()
/** 注册 Graphin line Edge */
registerGraphinLine()
/** 注册 Graphin Rect Line Edge */
registerGraphinRectLine()
/** 解构静态方法 */
const { registerFontFamily } = Graphin
/** export */
export default Graphin
export { Utils, Behaviors, useContext, registerFontFamily }
export {
  /** export G6 */
  default as G6,
  /** export G6 Type  */
  Graph
} from '@antv/g6'
