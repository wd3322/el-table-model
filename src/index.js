import Utils from './utils.js'
import ElTableModel from './main.vue'
import DefaultAttrs from './attrs'
import './style.scss'

export default {
  install(Vue, attrs) {
    if (attrs) {
      const errorHeader = 'el-table-model install config'
      if (Utils.getPrototype(attrs) !== 'object') {
        throw new Error(`${errorHeader} is not a object`)
      }
      if (Utils.getPrototype(attrs.ui) !== 'object') {
        throw new Error(`${errorHeader} 'ui' is not a object`)
      }
      if (Utils.getPrototype(attrs.component) !== 'object') {
        throw new Error(`${errorHeader} 'component' is not a object`)
      }
      if (!['object', 'function', 'asyncfunction'].includes(Utils.getPrototype(attrs.component.table))) {
        throw new Error(`${errorHeader} 'component.table' is not a object or function`)
      }
      if (!['object', 'function', 'asyncfunction'].includes(Utils.getPrototype(attrs.component.tableColumn))) {
        throw new Error(`${errorHeader} 'component.tableColumn' is not a object or function`)
      }
      if (!['object', 'function', 'asyncfunction'].includes(Utils.getPrototype(attrs.component.pagination))) {
        throw new Error(`${errorHeader} 'component.pagination' is not a object or function`)
      }
    }
    const mixin = DefaultAttrs.get(attrs || {})
    Vue.mixin(mixin)
    Vue.component('el-table-model', ElTableModel)
  }
}
