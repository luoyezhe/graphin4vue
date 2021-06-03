<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
// todo ,G6@unpack版本将规范类型的输出
import G6 from '@antv/g6'
import { deepMix } from '@antv/util'
/** utils */
// import shallowEqual from './utils/shallowEqual';
import deepEqual from './utils/deepEqual'
import cloneDeep from 'lodash-es/cloneDeep'
/** Context */
/** 内置 Behaviors */
import Behaviors from './behaviors'
/** 内置布局 */
import LayoutController from './layout'
/** 内置API */
import ApiController from './apis'
import { TREE_LAYOUTS, DEFAULT_TREE_LAYOUT_OPTIONS } from './consts'
import { getDefaultStyleByTheme } from './theme/index'
import Provide from './Provide'

const {
  DragCanvas,
  ZoomCanvas,
  DragNode,
  DragCombo,
  ClickSelect,
  BrushSelect,
  ResizeCanvas,
  Hoverable,
  SelectRelations
} = Behaviors

export default {
  props: {
    data: Object,
    layout: Object
  },
  setup (props, context) {
    let innerData = null
    let isTree = false
    let innerWidth = null
    let innerHeight = null
    let innerOptions = null
    let innerLayout = null
    let apis = null
    let graph = null
    const isReady = ref(false)
    const RefGraphDOM = ref()
    const innerTheme = ref()
    const innerContext = ref()
    const {
      modes = { default: [] },
      style
    } = context.attrs
    console.error('1')
    const initData = (init) => {
      if (init.children) {
        isTree = true
      }
      innerData = cloneDeep(init)
    }

    const initGraphInstance = () => {
      const {
        theme,
        width,
        height,
        defaultCombo,
        defaultEdge,
        defaultNode,
        nodeStateStyles,
        edgeStateStyles,
        comboStateStyles,
        animate,
        handleAfterLayout,
        ...otherOptions
      } = context.attrs

      if (modes.value?.default.length > 0) {
        // TODO :给用户正确的引导，推荐使用Graphin的Behaviors组件
        console.info('%c suggestion: you can use @graphin Behaviors components',
          'color:lightgreen'
        )
      }
      // graphDOM = this.$refs.graphDOM
      /**  width and height */
      const { clientWidth, clientHeight } = RefGraphDOM.value
      // const {
      //   width: clientWidth,
      //   height: clientHeight
      // } = RefGraphDOM.value.getBoundingClientRect()
      /** shallow clone */
      initData(props.data)
      /** 重新计算宽度 */
      innerWidth = Number(width) || clientWidth || 500
      innerHeight = Number(height) || clientHeight || 500
      const themeResult = getDefaultStyleByTheme(theme)
      const {
        defaultNodeStyle,
        defaultEdgeStyle,
        defaultComboStyle,
        defaultNodeStatusStyle,
        defaultEdgeStatusStyle,
        defaultComboStatusStyle,
        ...otherTheme
      } = themeResult
      /** graph type */
      isTree =
        Boolean(props.data.children) ||
        TREE_LAYOUTS.indexOf(String(props.layout?.type)) !== -1
      const isGraphinNodeType =
        defaultNode?.type === undefined ||
        defaultNode?.type === defaultNodeStyle.type
      const isGraphinEdgeType =
        defaultEdge?.type === undefined ||
        defaultEdge?.type === defaultEdgeStyle.type
      const finalStyle = {
        defaultNode: isGraphinNodeType
          ? deepMix({}, defaultNodeStyle, defaultNode)
          : defaultNode,
        defaultEdge: isGraphinEdgeType
          ? deepMix({}, defaultEdgeStyle, defaultEdge)
          : defaultEdge,
        defaultCombo: deepMix({}, defaultComboStyle, defaultCombo),
        /** status 样式 */
        nodeStateStyles: isGraphinNodeType
          ? deepMix({}, defaultNodeStatusStyle, nodeStateStyles)
          : nodeStateStyles,
        edgeStateStyles: isGraphinEdgeType
          ? deepMix({}, defaultEdgeStatusStyle, edgeStateStyles)
          : edgeStateStyles,
        comboStateStyles: deepMix(
          {},
          defaultComboStatusStyle,
          comboStateStyles
        )
      }
      innerTheme.value = { ...finalStyle, ...otherTheme }
      innerOptions = {
        container: RefGraphDOM.value,
        renderer: 'canvas',
        width: innerWidth,
        height: innerHeight,
        animate: animate !== false,
        ...finalStyle,
        modes: modes.value,
        ...otherOptions
      }
      if (isTree) {
        innerOptions.layout = props.layout || DEFAULT_TREE_LAYOUT_OPTIONS
        graph = new G6.TreeGraph(Object.assign({}, innerOptions, { layout: props.layout }))
      } else {
        graph = new G6.Graph(Object.assign({}, innerOptions, { layout: props.layout }))
      }
      /** 内置事件:AfterLayout 回调 */
      graph.on('afterlayout', () => {
        if (handleAfterLayout) {
          handleAfterLayout(graph)
        }
      })
      /** 装载数据 */
      graph.data(innerData)
      /** 初始化布局：仅限网图 */
      if (isTree) {
        innerLayout = new LayoutController(context)
        innerLayout.start()
      }
      // this.graph.get('canvas').set('localRefresh', true);
      /** 渲染 */
      graph.render()
      /** FitView 变为组件可选 */
      /** 初始化状态 */
      initStatus()
      /** 生成API */
      apis = ApiController(graph)
      /** 设置Context */
      innerContext.value = {
        apis,
        graph,
        theme: innerTheme.value,
        layout: innerLayout
      }
      isReady.value = true
    }

    // eslint-disable-next-line no-unused-vars
    const updateLayout = () => {
      // TODO
      innerLayout.changeLayout()
    }
    // eslint-disable-next-line no-unused-vars
    const updateOptions = () => {
      // TODO
      const { ...options } = props
      return options
    }

    const initStatus = () => {
      if (!isTree) {
        const {
          nodes = [],
          edges = []
        } = innerData
        nodes.forEach((node) => {
          const { status } = node
          if (status) {
            Object.keys(status).forEach((k) => {
              graph.setItemState(node.id, k, Boolean(status[k]))
            })
          }
        })
        edges.forEach((edge) => {
          const { status } = edge
          if (status) {
            Object.keys(status).forEach((k) => {
              graph.setItemState(edge.id, k, Boolean(status[k]))
            })
          }
        })
      }
    }

    const clear = () => {
      if (innerLayout?.destroy) {
        innerLayout.destroy() // tree graph
      }
      innerLayout = {}
      graph.clear()
      innerData = {
        nodes: [],
        edges: [],
        combos: []
      }
      graph.destroy()
    }

    // 监听theme变化
    watch(props.graphTheme, (newVal, oldVal) => {
      const isThemeChange = newVal.children !== oldVal.children
      if (isThemeChange) {
        // TODO :Node/Edge/Combo 批量调用 updateItem 来改变
      }
    })
    // 监听图谱配置变化
    watch(props.options, (newVal, oldVal) => {
      const isOptionsChange = newVal.children !== oldVal.children
      if (isOptionsChange) {
        // this.updateOptions();
      }
    })
    // 监听数据变化
    watch(props.data, (newVal, oldVal) => {
      const isGraphTypeChange = newVal.children !== oldVal.children

      /** 图类型变化 */
      if (isGraphTypeChange) {
        console.error(
          'The data types of pervProps.data and props.data are inconsistent,Graphin does not support the dynamic switching of TreeGraph and NetworkGraph'
        )
        return
      }
      const isDataChange = !deepEqual(newVal, oldVal)
      /** 数据变化 */
      if (isDataChange) {
        initData(newVal)
        innerLayout.changeLayout()
        graph.data(innerData)
        graph.changeData(innerData)
        initStatus()
        apis = ApiController(graph)
        // console.log('%c isDataChange', 'color:grey');
        innerContext.value = {
          apis,
          graph,
          theme: innerTheme.value,
          layout: innerLayout
        }
        graph.emit('graphin:datachange')
      }
    })
    // 监听布局变化
    watch(props.layout, (newVal, oldVal) => {
      const isLayoutChange = !deepEqual(newVal, oldVal)
      if (isLayoutChange) {
        if (isTree) {
          graph.updateLayout(newVal)
          return
        }
        /**
         * TODO
         * 1. preset 前置布局判断问题
         * 2. enablework 问题
         * 3. G6 LayoutController 里的逻辑
         */
        /** 数据需要从画布中来 */
        innerData = innerLayout.getDataFromGraph()
        innerLayout.changeLayout()
        innerLayout.refreshPosition()
        /** 走G6的layoutController */
        // this.graph.updateLayout();
        // console.log('%c isLayoutChange', 'color:grey');
        innerLayout.emit('graphin:layoutchange')
      }
    })

    onMounted(() => {
      initGraphInstance()
    })

    onUnmounted(() => {
      clear()
    })

    // return {
    //   innerData,
    //   isTree,
    //   RefGraphDOM,
    //   innerTheme,
    //   graph,
    //   isReady,
    //   ...toRefs(refsData)
    // }
    // const fragment = [
    //   <DragCanvas/>,
    //   <ZoomCanvas/>,
    //   <DragNode/>,
    //   <DragCombo/>,
    //   <ClickSelect/>,
    //   <BrushSelect/>,
    //   <SelectRelations/>,
    //   <ResizeCanvas graphDOM="RefGraphDOM"/>,
    //   <Hoverable/>
    // ]
    return () =>
      <div className="graphin-container">
        <div
          data-testid="custom-element"
          class="graphin-core"
          ref={ (ref) => { RefGraphDOM.value = ref } }
          style={{ backGround: innerTheme.value?.background, ...style?.value }}
        ></div>
        <div class="graphin-components"></div>
        { isReady.value ? (
          <Provide value = { innerContext.value }>
            { context.slots.default() }
          </Provide>
        ) : (
          ''
        )}
      </div>
  },
  components: {
    DragCanvas,
    ZoomCanvas,
    DragNode,
    DragCombo,
    ClickSelect,
    BrushSelect,
    SelectRelations,
    ResizeCanvas,
    Hoverable,
    Provide
  },
  /*
  render () {
    const {
      modes,
      style
    } = this.$attrs
    const fragment = [
      <DragCanvas/>,
      <ZoomCanvas/>,
      <DragNode/>,
      <DragCombo/>,
      <ClickSelect/>,
      <BrushSelect/>,
      <SelectRelations/>,
      <ResizeCanvas graphDOM="RefGraphDOM"/>,
      <Hoverable/>
    ]
    const { isReady } = this
    return (
      <div id="graphin-container">
        <div
          data-testid="custom-element"
          class="graphin-core"
          ref="RefGraphDOM"
          style={{ backGround: innerTheme?.innerTheme.value.background, ...style }}
        ></div>
        <div class="graphin-components"></div>
        {isReady ? (
          <Provide value={innerContext}>
            {context.$slots.default}
            {modes ? '' : fragment.map((item) => item)}
          </Provide>
        ) : (
          ''
        )}
      </div>
    )
  },
   */
  inheritAttrs: false
}
</script>

<style>
#graphin-container {
  height: 100%;
  width: 100%;
}

.graphin-core {
  height: 100%;
  width: 100%;
  min-height: 500px;
  background: #fff;
}
</style>
