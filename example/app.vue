<script>
/* eslint-disable */
import { reactive, toRefs, ref } from 'vue'
import { useToggle } from '@vueuse/core'
import { } from '@graphin-components'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  PieChartOutlined,
  DeleteOutlined,
  VideoCameraAddOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue'
import { Utils } from '@graphin'
import { default as SGraphin } from '@graphin'
import iconsLoader from '@antv/graphin-icons'
const icons = SGraphin.registerFontFamily(iconsLoader)
const DATA = Utils.mock(10).circle().graphin()
// console.error('icons', icons)
export default {
  name: 'App',
  setup () {
    const data = reactive({
      nodes: [
        { id: '1', label: 'a' },
        { id: '2', label: 'b' },
        { id: '3', label: 'c' }
      ],
      edges: [
        { source: '1', target: '2' },
        { source: '1', target: '3' }
      ]
    })
    // const data = reactive(DATA)

    const menuItems = reactive([
      { key: 'tag', icon: 'tag', name: '打标' },
      { key: 'delete', icon: 'delete', name: '删除' },
      { key: 'expand', icon: 'expand', name: '扩散' }
    ])

    const layout = reactive({
      type: 'force',
      linkDistance: 200,
      nodeStrength: 30,
      edgeStrength: 0.1,
      preventOverlap: true,
      onTick: () => {
        // console.log('ticking')
      },
      onLayoutEnd: () => {
        console.log('force layout done')
      }
    })

    const defaultNode = reactive({
      size: 30,
      type: 'circle',
      style: {
        fill: '#3A9FFF',
        stroke: 'red',
        lineWidth: 1
      },
      labelConfig: {
        position: 'bottom',
        fontSize: 12,
        color: '#1C2D5A',
        style: {
          fill: '#1C2D5A'
        }
      }
    })

    const defaultEdge = reactive({
      type: 'line',
      style: {
        fill: '#B3B9C6',
        lineWidth: 1
      }
    })

    const modes = reactive({
      default: [
        'drag-canvas', 'zoom-canvas', 'drag-node', 'hover'
      ]
    })

    const ToolTipNodeRender = (h, item) => {
      let _label = item?.getModel().label
      if (_label) {
        return h("div", _label)
      }
      return null
    }

    const toolbarOptions = [
      {
        key: 'zoomOut',
        name: (
          <span>
            放大<ZoomInOutlined />
          </span>
        ),
        icon: <ZoomInOutlined />
      },
      {
        key: 'zoomIn',
        name: <ZoomOutOutlined />
      },
      {
        key: 'visSetting',
        name: <PieChartOutlined />
      },
      {
        key: 'clearCanvas',
        name: <DeleteOutlined />
      },
      {
        key: 'showHideElement',
        name: <VideoCameraAddOutlined />
      }
    ]

    const handleClick = (grapinContext, config) => {
      const { apis } = grapinContext
      const { handleZoomIn, handleZoomOut } = apis
      if (config.key === 'zoomIn') {
        handleZoomIn()
      } else if (config.key === 'zoomOut') {
        handleZoomOut()
      }
    }

    const createEdgeState = reactive({
      active: false
    })

    const HandleCreateEdgeChange = (edges, edge) => {
      console.error('HandleCreateEdge')
      const pEdges = Utils.processEdges(edges, { poly: 50, loop: 10 })

      data.edges = pEdges
    }

    const handleCreateEdgeClick = () => {
      createEdgeState.active = !createEdgeState.active
      console.error('handleCreateEdgeClick', createEdgeState.active)
    }

    const fishEyeVisible = ref(false)

    const handleFishEyeClose = () => {
      fishEyeVisible.value = false
    }
    const handleFishEyeClick = () => {
      fishEyeVisible.value = true
    }


    const hullOptions = [
      { members: ['1', '2'] },
      {
        members: ['1', '3'],
        type: 'bubble',
        padding: 10,
        style: {
          fill: 'lightgreen',
          stroke: 'green'
        }
      }
    ]

    const Color = {
      company: {
        primaryColor: '#ffc107'
      },
      person: {
        primaryColor: '#28a52d'
      }
    }

    data.nodes.forEach((node, index) => {
      const isCompany = index % 2 === 0
      const iconType = isCompany ? 'company' : 'person'
      node.data = {
        type: iconType
      }
      node.type = 'graphin-circle'
      const { primaryColor } = Color[iconType]
      node.style = {
        keyshape: {
          size: 30,
          stroke: primaryColor,
          fill: primaryColor,
          fillOpacity: 0.2
        },
        icon: {
          type: 'font',
          fontFamily: 'graphin',
          value: isCompany ? icons.company : icons.user,
          size: 14,
          fill: primaryColor
        }
      }
    })

    const state = reactive({
      count: 1
    })

    const { count } = toRefs(state)

    setTimeout(() => {
      state.count = 5
    }, 3000)

    return () => <div>
      <Graphin
        data={data}
        layout={layout}
        defaultNode={defaultNode}
        defaultEdge={defaultEdge}
        modes={modes}
        fitViewPadding={() => [10, 20]}
      >
      </Graphin>
      <div className="test-area">
        123
      </div>
    </div>

    // return {
    //   data,
    //   layout,
    //   defaultNode,
    //   defaultEdge,
    //   modes,
    //   menuItems,
    //   visible,
    //   test
    // }
  },
  components: { }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  position: relative;
  .test-area{
    z-index: 1000;
    position: absolute;
    left: 0;
    top: 0;
    background: greenyellow;
  }
}
</style>
