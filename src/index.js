import ElTableModel from './ElTableModel.vue'
import defaultAttrs from './attrs'
import './index.scss'

const Loading = {
  install: function(Vue, attrs = {}) {
    const errorHeader = 'el-table-model install config'
    if (!attrs || typeof attrs !== 'object') {
      throw new Error(`${errorHeader} is not a object`)
    }
    if (!attrs.global || typeof attrs.global !== 'object') {
      throw new Error(`${errorHeader} 'global' is not a object`)
    }
    if (!attrs.global.propName || typeof attrs.global.propName !== 'object') {
      throw new Error(`${errorHeader} 'global.propName' is not a object`)
    }
    if (!attrs.global.propName.currentPage || typeof attrs.global.propName.currentPage !== 'string') {
      throw new Error(`${errorHeader} 'global.propName.currentPage' is not a string`)
    }
    if (!attrs.global.propName.pageSize || typeof attrs.global.propName.pageSize !== 'string') {
      throw new Error(`${errorHeader} 'global.propName.pageSize' is not a string`)
    }
    if (!attrs.component || typeof attrs.component !== 'object') {
      throw new Error(`${errorHeader} 'component' is not a object`)
    }
    if (!attrs.component.table || (typeof attrs.component.table !== 'object' && typeof attrs.component.table !== 'function')) {
      throw new Error(`${errorHeader} 'component.table' is not a object or function`)
    }
    if (!attrs.component.tableColumn || (typeof attrs.component.tableColumn !== 'object' && typeof attrs.component.tableColumn !== 'function')) {
      throw new Error(`${errorHeader} 'component.tableColumn' is not a object or function`)
    }
    if (!attrs.component.pagination || (typeof attrs.component.pagination !== 'object' && typeof attrs.component.pagination !== 'function')) {
      throw new Error(`${errorHeader} 'component.pagination' is not a object or function`)
    }
    const mixin = defaultAttrs.get(attrs)
    Vue.mixin(mixin)
    Vue.component('el-table-model', ElTableModel)
  }
}

export default Loading
