import { useContext, G6 } from '@graphin'
import { watchEffect } from 'vue'

const EdgeBundling = {
  setup () {
    const { graph } = useContext()
    watchEffect(() => {
      const edgeBundling = new G6.Bundling({
        bundleThreshold: 0.6,
        K: 100
      })
      const data = graph.save()
      graph.addPlugin(edgeBundling)
      edgeBundling.bundling(data)
      graph.data(data)
      graph.render()
    })
    return () => null
  }
}

export default EdgeBundling
