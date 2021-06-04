// import { handleAutoZoom, handleRealZoom, handleChangeZoom, handleZoomIn, handleZoomOut } from './zoom';
// import { focusNodeById, highlightNodeById } from './element';
import * as zoomApis from './zoom'
import * as elementApis from './element'

const apis = {
  ...zoomApis,
  ...elementApis
}
const ApiController = (graph) => {
  const apiKeys = Object.keys(apis)
  return apiKeys.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: apis[curr](graph)
    }
  }, {})
}
export default ApiController
