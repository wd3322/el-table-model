import ElTableModel from './ElTableModel.vue'
import defaultAttrs from './attrs'
import './index.scss'

const Loading = {
  install: function(Vue, attrs = {}) {
    const errorHeader = '[el-form-model error] install config'
    if (Object.prototype.toString.call(attrs) !== '[object Object]') {
      throw { message: `${errorHeader} is not a object` }
    }
    if (Object.prototype.toString.call(attrs.global) !== '[object Object]') {
      throw { message: `${errorHeader} 'global' is not a object` }
    }
    if (Object.prototype.toString.call(attrs.global.propName) !== '[object Object]') {
      throw { message: `${errorHeader} 'global.propName' is not a object` }
    }
    if (Object.prototype.toString.call(attrs.global.propName.currentPage) !== '[object String]') {
      throw { message: `${errorHeader} 'global.propName.currentPage' is not a string` }
    }
    if (Object.prototype.toString.call(attrs.global.propName.pageSize) !== '[object String]') {
      throw { message: `${errorHeader} 'global.propName.pageSize' is not a string` }
    }
    if (Object.prototype.toString.call(attrs.component) !== '[object Object]') {
      throw { message: `${errorHeader} 'component' is not a object` }
    }
    if (
      Object.prototype.toString.call(attrs.component.table) !== '[object Object]' &&
      Object.prototype.toString.call(attrs.component.table) !== '[object Function]'
    ) {
      throw { message: `${errorHeader} 'component.table' is not a object or function` }
    }
    if (
      Object.prototype.toString.call(attrs.component.tableColumn) !== '[object Object]' &&
      Object.prototype.toString.call(attrs.component.tableColumn) !== '[object Function]'
    ) {
      throw { message: `${errorHeader} 'component.tableColumn' is not a object or function` }
    }
    const mixin = defaultAttrs.get(attrs)
    Vue.mixin(mixin)
    Vue.component('el-table-model', ElTableModel)
  }
}

export default Loading
