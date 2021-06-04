import ForceLayout from './ForceLayout'

const forceOptions = {}
export default () => {
  onmessage = e => {
    const { data } = e
    /** parser an object with method */
    const newForceOptions = JSON.parse(JSON.stringify(forceOptions), (key, value) => {
      if (typeof value === 'string' && value.indexOf('function ') === 0) {
        // eslint-disable-next-line no-eval
        return eval(`(${value})`)
      }
      return value
    })
    const simulation = new ForceLayout({
      ...newForceOptions,
      done: () => {
        postMessage({
          done: true
        })
        if (newForceOptions.done) {
          newForceOptions.done()
        }
      }
    })
    simulation.setData(data)
    simulation.register('render', (forceData) => {
      postMessage({
        forceData,
        done: false
      })
    })
    simulation.start()
  }
}
