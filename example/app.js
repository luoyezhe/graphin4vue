import { createApp } from 'vue'
import App from './app.vue'
import Graphin from '@graphin'

const app = createApp(App)
app.use(Graphin)
app.mount('#root')
