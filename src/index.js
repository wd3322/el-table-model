import defaultAttrs from './attrs'
import app from './app.vue'

const Loading = {
  install: function(Vue, attrs = {}) {
    const mixin = defaultAttrs.get(attrs)
    Vue.mixin(mixin)
    Vue.component('el-table-model', app)
  }
}

export default Loading