import Vector from './Vector'
import Point from './Point'
import { Node, Edge } from './Elements'
import Spring from './Spring'
import { getDegree } from '../utils/graph'

class ForceLayout {
  constructor (options) {
    /**
     * Iterate options to update this.props
     * @param {*} options
     */
    this.updateOptions = (options) => {
      if (!options) {
        return
      }
      Object.keys(options).forEach(key => {
        this.props[key] = options[key]
      })
    }
    this.setData = (data) => {
      // clean all data
      this.nodes = []
      this.edges = []
      this.nodeSet = {}
      this.edgeSet = {}
      this.nodePoints = new Map()
      this.edgeSprings = new Map()
      this.sourceData = data
      this.averageDistance = 0
      // add nodes and edges
      if ('nodes' in data || 'edges' in data) {
        this.addNodes(data.nodes)
        // eslint-disable-next-line
        this.addEdges(data.edges)
      }
    }
    this.getMass = (node) => {
      const {
        degree = getDegree(node, this.edges), // 节点度数
        force
      } = node.layout || {}
      /** 当你在layout.force.mass中制定了才使用 */
      if (force && force.mass) {
        // eslint-disable-next-line prefer-destructuring
        return force.mass
      }
      /** 默认质量都是通过节点的度数自动计算的 */
      return degree < 5 ? 1 : degree * 10
    }
    this.init = () => {
      /** 初始化点和边的信息 */
      const {
        width,
        height
      } = this.props
      this.nodes.forEach(node => {
        const x = node.data.x || width / 2
        const y = node.data.y || height / 2
        const vec = new Vector(x, y)
        if (!node.data.layout) {
          node.data.layout = {}
        }
        const degree = getDegree(node, this.edges)
        node.data.layout.degree = degree
        const mass = this.getMass(node.data)
        this.nodePoints.set(node.id, new Point(vec, String(node.id), node.data, mass))
      })
      this.edges.forEach(edge => {
        const source = this.nodePoints.get(edge.source.id)
        const target = this.nodePoints.get(edge.target.id)
        const length = this.props.defSpringLen(edge, source, target)
        this.edgeSprings.set(edge.id, new Spring(source, target, length))
      })
      /** 其他参数设置 */
      const { size } = this.nodePoints
      const vv = Math.pow(10, 2)
      this.props.minEnergyThreshold = (1 / 2) * Math.pow(1, 2) * 1 * size * vv
    }
    this.start = () => {
      /** 初始化节点 */
      this.init()
      if (this.props.animation) {
        this.animation()
      } else {
        this.slienceForce()
      }
    }
    this.calTotalEnergy = () => {
      let energy = 0.0
      this.nodes.forEach(node => {
        const point = this.nodePoints.get(node.id)
        const speed = point.v.magnitude()
        const { m } = point // 1;
        energy += m * Math.pow(speed, 2) * 0.5 // p = 1/2*(mv^2)
      })
      return energy
    }
    this.slienceForce = () => {
      const { done } = this.props
      for (let i = 0; this.averageDistance > 0.5 || i < 1; i++) {
        this.tick(this.props.tickInterval)
        this.iterations++
      }
      this.render()
      done && done() // eslint-disable-line
    }
    /** polyfill: support webworker requestAnimationFrame */
    this.requestAnimationFrame = (fn) => {
      const { enableWorker } = this.props
      if (enableWorker) {
        return setInterval(() => {
          fn()
        }, 16)
      }
      return window.requestAnimationFrame(fn)
    }
    this.cancelAnimationFrame = (handleId) => {
      const { enableWorker } = this.props
      if (enableWorker) {
        clearInterval(handleId)
      } else {
        window.cancelAnimationFrame(handleId)
      }
    }
    this.animation = () => {
      if (this.props.enableWorker) {
        let startTimer = new Date().valueOf()
        const firstTickInterval = 0.22
        const interval = (step) => {
          // 目标：迭代10次，稳定在2s，函数选择需要后续考虑
          return step > 10 ? 2000 : 20 * step * step
        }
        for (let i = 0; i < this.props.MaxIterations; i++) {
          const tickInterval = Math.max(0.02, firstTickInterval - i * 0.002)
          this.tick(tickInterval)
          const diff = new Date().valueOf() - startTimer
          if (diff >= interval(i)) {
            this.render()
            startTimer = new Date().valueOf()
          }
          const energy = this.calTotalEnergy()
          /** 如果需要监控信息，则提供给用户 */
          const monitor = this.registers.get('monitor')
          if (monitor) {
            monitor(this.reportMointor(energy))
          }
          // console.log('average', this.averageDistance);
          if (this.averageDistance < 0.5) {
            this.render()
            if (this.props.done) {
              this.props.done()
            }
            return
          }
        }
        return
      }
      const step = () => {
        const {
          done,
          tickInterval
        } = this.props
        this.tick(tickInterval)
        this.render()
        this.iterations++
        const energy = this.calTotalEnergy()
        /** 如果需要监控信息，则提供给用户 */
        const monitor = this.registers.get('monitor')
        if (monitor) {
          monitor(this.reportMointor(energy))
        }
        // console.log('average', this.averageDistance);
        if (this.averageDistance < 0.5) {
          this.cancelAnimationFrame(this.timer)
          this.iterations = 0
          this.done = true
          if (done) {
            done()
          }
        } else {
          this.timer = this.requestAnimationFrame(step)
        }
      }
      this.timer = this.requestAnimationFrame(step)
    }
    this.render = () => {
      const render = this.registers.get('render')
      const nodes = []
      this.nodePoints.forEach(node => {
        nodes.push({
          ...(this.nodeSet[node.id] && this.nodeSet[node.id].data),
          x: node.p.x,
          y: node.p.y
        })
      })
      if (render) {
        render({
          nodes,
          edges: this.sourceData.edges
        })
      } else {
        // eslint-disable-next-line no-console
        console.error('need a render function')
      }
    }
    this.reportMointor = (energy) => {
      const params = {
        energy,
        iterations: this.iterations,
        nodes: this.nodes,
        edges: this.edges
        // memory: window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize,
      }
      return params
    }
    this.tick = (interval) => {
      this.updateCoulombsLaw()
      this.updateHookesLaw()
      this.attractToCentre()
      this.updateVelocity(interval)
      this.updatePosition(interval)
    }
    /** 布局算法 */
    this.updateCoulombsLaw = () => {
      const len = this.nodes.length
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          // eslint-disable-next-line no-continue
          if (i === j) {
            continue
          }
          const iNode = this.nodes[i]
          const jNode = this.nodes[j]
          const { coulombDisScale } = this.props
          const { repulsion } = this.props
          const v = this.nodePoints.get(iNode.id).p.subtract(this.nodePoints.get(jNode.id).p)
          const dis = (v.magnitude() + 0.1) * coulombDisScale
          const direction = v.normalise() // 向量的方向：基向量
          const factor = 1
          this.nodePoints.get(iNode.id).updateAcc(
            // 得到库伦力
            direction.scalarMultip(repulsion * factor).divide(Math.pow(dis, 2)))
          this.nodePoints.get(jNode.id).updateAcc(direction.scalarMultip(repulsion * factor).divide(-Math.pow(dis, 2)))
        }
      }
    }
    this.updateHookesLaw = () => {
      this.edges.forEach(edge => {
        const spring = this.edgeSprings.get(edge.id)
        const v = spring.target.p.subtract(spring.source.p)
        const displacement = spring.length - v.magnitude()
        const direction = v.normalise()
        spring.source.updateAcc(direction.scalarMultip(-this.props.stiffness * displacement))
        spring.target.updateAcc(direction.scalarMultip(this.props.stiffness * displacement))
      })
    }
    this.attractToCentre = () => {
      const implementForce = (node, center, radio = 2) => {
        const point = this.nodePoints.get(node.id)
        const direction = point.p.subtract(center)
        point.updateAcc(direction.scalarMultip(-radio))
      }
      this.nodes.forEach(node => {
        // 默认的向心力指向画布中心
        const degree = (node.data && node.data.layout && node.data.layout.degree)
        const leafNode = degree === 1
        const singleNode = degree === 0
        /** 默认的向心力配置 */
        const defaultRadio = {
          leaf: 2,
          single: 2,
          others: 1,
          // eslint-disable-next-line
          center: (_node) => {
            return {
              x: this.props.width / 2,
              y: this.props.height / 2
            }
          }
        }
        const {
          leaf,
          single,
          others,
          center
        } = { ...defaultRadio, ...this.props.centripetalOptions }
        const {
          x,
          y
        } = center(node)
        const centerVector = new Vector(x, y)
        /** 如果radio为0，则认为忽略向心力 */
        if (leaf === 0 || single === 0 || others === 0) {
          return
        }
        if (singleNode) {
          implementForce(node, centerVector, single)
          return
        }
        if (leafNode) {
          implementForce(node, centerVector, leaf)
          return
        }
        /** others */
        implementForce(node, centerVector, others)
      })
    }
    this.updateVelocity = (interval) => {
      this.nodes.forEach(node => {
        const point = this.nodePoints.get(node.id)
        point.v = point.v
          .add(point.a.scalarMultip(interval)) // 根据加速度求速度公式 V_curr= a*@t + V_pre
          .scalarMultip(this.props.damping)
        if (point.v.magnitude() > this.props.maxSpeed) {
          point.v = point.v.normalise().scalarMultip(this.props.maxSpeed)
        }
        point.a = new Vector(0, 0)
      })
    }
    this.updatePosition = (interval) => {
      let sum = 0
      this.nodes.forEach(node => {
        const point = this.nodePoints.get(node.id)
        const distance = point.v.scalarMultip(interval)
        sum = sum + distance.magnitude()
        point.p = point.p.add(point.v.scalarMultip(interval)) // 路程公式 s = v * t
      })
      this.averageDistance = sum / this.nodes.length
    }
    /**
     * add one Node
     * @param {[type]} node [description]
     */
    this.addNode = (node) => {
      const { ignore } = this.props
      if (ignore && ignore(node)) {
        return
      }
      if (!(node.id in this.nodeSet)) {
        this.nodes.push(node)
      }
      this.nodeSet[node.id] = node
    }
    /**
     * add Nodes
     * @param {[type]} data [description]
     */
    this.addNodes = (data) => {
      data.forEach(node => {
        this.addNode(new Node(node))
      })
    }
    /**
     * add one Edge
     * @param {[type]} edge [description]
     */
    this.addEdge = (edge) => {
      if (!(edge.id in this.edgeSet)) {
        this.edges.push(edge)
      }
      this.edgeSet[edge.id] = edge
      return edge
    }
    /**
     * add Edges
     * @param {[type]} data [description]
     */
    this.addEdges = (data) => {
      try {
        const len = data.length
        for (let i = 0; i < len; i++) {
          const e = data[i]
          const sourceId = e.source
          const targetId = e.target
          // eslint-disable-next-line
          const node1 = this.nodeSet[sourceId]
          if (node1 === undefined) {
            throw new TypeError(`invalid node name: ${e.source}`)
          }
          // eslint-disable-next-line
          const node2 = this.nodeSet[targetId]
          if (node2 === undefined) {
            throw new TypeError(`invalid node name: ${e.target}`)
          }
          const attr = e.data
          const edge = new Edge(String(this.nextEdgeId++), node1, node2, attr)
          this.addEdge(edge)
        }
      } catch (error) {
        console.error(error)
      }
    }
    this.register = (type, options) => {
      this.registers.set(type, options) // 将用户的自定义函数注册进来
    }
    this.restart = (dragNode, graph) => {
      /** 将位置更新到nodePoint中 */
      const { ignore } = this.props
      graph.getNodes().forEach((nodeItem) => {
        const node = nodeItem.get('model')
        if (ignore && ignore(node)) {
          return
        }
        const vec = new Vector(node.x, node.y)
        const point = this.nodePoints.get(node.id)
        if (point) {
          point.p = vec
          this.nodePoints.set(node.id, point)
        }
      })
      const changeNodePosition = (node) => {
        const vec = new Vector(node.x, node.y)
        // const mass = (node.layout && node.layout.force && node.layout.force.mass) || 100000;
        const mass = this.getMass(node)
        this.nodePoints.set(node.id, new Point(vec, node.id, node.data, mass))
        this.edges.forEach(edge => {
          const source = this.nodePoints.get(edge.source.id)
          const target = this.nodePoints.get(edge.target.id)
          if (source.id === node.id || target.id === node.id) {
            const length = this.edgeSprings.get(edge.id).length || 100
            this.edgeSprings.set(edge.id, new Spring(source, target, length))
          }
        })
      }
      // TODO:支持多点拖拽
      dragNode.forEach(changeNodePosition)
      if (this.props.restartAnimation) {
        this.animation()
      } else {
        this.slienceForce()
      }
    }
    this.stop = () => {
      window.cancelAnimationFrame(this.timer)
      this.done = true
    }
    this.props = {
      stiffness: 200.0,
      enableWorker: false,
      defSpringLen: edge => {
        return edge.data.spring || 200
      },
      repulsion: 200.0 * 5,
      centripetalOptions: {
        leaf: 2,
        single: 2
      },
      damping: 0.9,
      minEnergyThreshold: 0.1,
      maxSpeed: 1000,
      coulombDisScale: 0.005,
      tickInterval: 0.02,
      groupFactor: 4,
      MaxIterations: 10000,
      animation: true,
      restartAnimation: true,
      width: 200,
      height: 200
    }
    this.updateOptions(options)
    /** 存放器：节点与边 */
    this.sourceData = {
      nodes: [],
      edges: [],
      combos: []
    }
    this.nodes = []
    this.edges = []
    this.nodeSet = {}
    this.edgeSet = {}
    this.nodePoints = new Map()
    this.edgeSprings = new Map()
    this.registers = new Map()
    this.done = false
    this.averageDistance = 0
    /** 计数器 */
    this.iterations = 0
    this.nextEdgeId = 0 // 边属性计数自增
    this.timer = 0
    this.center = new Vector(0, 0)
  }
}

export default ForceLayout
