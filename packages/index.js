import Scetion2D from './src/Scetion2D.vue'

const plugin = {
  install(app) {
    app.component(Scetion2D.name, Scetion2D)
  }
}

export { Scetion2D, plugin }