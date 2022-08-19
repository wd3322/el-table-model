<template>
  <div class="table-model-wrap">
    <div class="table-model-content">
      <el-form 
        ref="form"
        :model="formModel"
        @validate="onValidateForm"
      >
        <el-table
          ref="table"
          v-loading="loading"
          :data="data"
          :class="{'drag-sort': rowDragSort}"
          v-bind="getAttrs('table')"
          v-on="$listeners"
        >
          <template v-for="(column, index) in columns.filter(item => !item.hidden)">

            <el-table-column 
              :key="index"
              v-bind="getAttrs('table-column', column)"
            >
              <template v-slot:header="scope">
                <slot 
                  v-if="column.headerSlot"
                  :name="column.headerSlot"
                  :index="scope.$index"
                  :column="scope.column"
                />
                <span v-else>{{ scope.column.label }}</span>
              </template>
              <template v-slot="scope" v-if="['slot', 'expand', 'editable'].includes(column.type)">
                <slot 
                  v-if="column.type === 'slot'"
                  :name="column.defaultSlot || column.prop"
                  :item="scope.row"
                  :index="scope.$index"
                  :value="scope.row[column.prop]"
                  :format="column.formatter ? column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) : null"
                  :refs="{
                    form: $refs.form,
                    table: $refs.table
                  }"
                />
                <slot
                  v-else-if="column.type === 'expand'"
                  name="expand"
                  :index="scope.$index"
                  :row="scope.row"
                />
                <div v-else-if="column.type === 'editable'">
                  <span v-if="currentEditable === column.prop + scope.$index || scope.row.$isEditable || validateProp[`list.${scope.$index}.${column.prop}`] === false">
                    <el-form-item
                      :prop="`list.${scope.$index}.${column.prop}`"
                      :rules="column.form.rules"
                      :row-index="scope.$index"
                    >
                      <span @click.stop>
                        <component
                          :is="{
                            input: 'el-input',
                            autocomplete: 'el-autocomplete',
                            count: 'el-input-number',
                            select: 'el-select',
                            cascader: 'el-cascader',
                            time: 'el-time-picker',
                            date: 'el-date-picker',
                            dates: 'el-date-picker',
                            datetime: 'el-date-picker',
                            month: 'el-date-picker',
                            year: 'el-date-picker'
                          }[column.form.type]"
                          ref="editable"
                          class="el-editable-form"
                          :style="{ width: column.form.width }"
                          v-model.trim="scope.row[column.prop]"
                          v-bind="getAttrs('form-item', column, scope)"
                          v-on="column.form.events"
                          @change="onChangeEditable(scope.row, scope.row[column.prop], column.prop, scope.$index)"
                          @select="onChangeEditable(scope.row, scope.row[column.prop], column.prop, scope.$index)"
                        >
                          <template v-if="column.form.type === 'select' && column.form.options">
                            <el-option
                              v-for="(option, optionsIndex) in column.form.options"
                              :key="optionsIndex"
                              v-bind="option"
                            >
                              <span v-if="option.type === 'slot'">
                                <slot 
                                  :name="option.label"
                                  :label="option.label"
                                  :value="option.value"
                                />
                              </span>
                              <span v-else>{{ option.label }}</span>
                            </el-option>
                          </template>
                        </component>
                      </span>
                    </el-form-item>
                  </span>
                  <span
                    v-else
                    :class="getEditable(column, scope) ? 'editable-text' : 'uneditable-text'"
                    @click.stop="onFocusEditable(column.prop, scope.$index, column)"
                  >
                    {{ column.formatter ? column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) : scope.row[column.prop] }}
                  </span>
                </div>
              </template>
            </el-table-column>

          </template>
        </el-table>
      </el-form>
    </div>

    <div
      v-if="hasData && queryApi.page"
      class="table-model-pagination"
    >
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="defaultAttrs.global.pageSizes"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="total"
        @size-change="onSetPage('size', $event)"
        @current-change="onSetPage('current', $event)"
      />
    </div>
  </div>
</template>

<script>
import { debounce } from 'debounce'

export default {
  name: 'ElTableModel',
  props: {
    queryApi: {
      type: Object,
      required: true,
      default: () => ({})
    },
    columns: {
      type: Array,
      required: true,
      default: () => [{}]
    },
    rowDragSort: {
      type: [Boolean, Object, Function],
      default: false
    }
  },
  data() {
    return {
      loading: true,
      data: [],
      pageSize: 0,
      currentPage: 1,
      total: 0,
      currentEditable: '',
      validateProp: {},
      getDataFun: debounce(this.getData, 200)
    }
  },
  computed: {
    formModel() {
      return {
        list: this.data
      }
    },
    apiChange() {
      return {
        ...this.queryApi,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
    },
    hasData() {
      return this.data.length > 0
    }
  },
  watch: {
    apiChange: {
      handler(nVal, oVal) {
        const { page } = this.queryApi
        if (
          nVal.currentPage > 1 && 
          nVal.currentPage === oVal.currentPage &&
          typeof page === 'boolean' && page
        ) {
          this.currentPage = 1
        } else {
          this.loading = true
          this.getDataFun()
        }
      },
      immediate: false,
      deep: true
    }
  },
  created() {
    const { immediate } = this.queryApi
    if (typeof immediate === 'boolean' && immediate) {
      this.getDataFun()
    } else {
      this.loading = false
    }
  },
  mounted() {
    if (this.rowDragSort === true) {
      this.onSortable()
    } else if (typeof this.rowDragSort === 'object') {
      const params = this.rowDragSort
      this.onSortable(params)
    } else if (typeof this.rowDragSort === 'function') {
      const params = this.rowDragSort({ ref: this.$refs.table })
      this.onSortable(params)
    }
    document.addEventListener('click', this.clearEditable)
  },
  destroyed() {
    document.removeEventListener('click', this.clearEditable)
  },
  methods: {
    getAttrs(type, column, scope) {
      let result = {}
      if (type === 'table') {
        result = {
          ...this.defaultAttrs.component.table,
          ...this.$attrs
        }
      } else if (type === 'table-column' && ['index', 'slot', 'editable', 'expand'].includes(column.type)) {
        result = {
          ...this.defaultAttrs.component[column.type],
          ...column
        }
        if (column.type === 'index') {
          result.index = this.getIndex
        } else if (column.type === 'slot') {
          delete result.type
        } else if (column.type === 'editable') {
          delete result.type
          delete result.form
        }
        delete result.hidden
      } else if (type === 'table-column' && column.prop) {
        result = {
          ...(
            typeof this.defaultAttrs.component.data === 'function'
            ? this.defaultAttrs.component.data(column)
            : this.defaultAttrs.component.data
          ),
          ...column
        }
        delete result.hidden
      } else if (type === 'form-item') {
        const appendProps = []
        const excludeProps = []
        result = {
          size: 'mini',
          placeholder: column.label || '',
          ...column.form
        }
        if (['count', 'select', 'cascader', 'time'].includes(column.form.type)) {
          appendProps.push('type')
        }
        if (['select'].includes(column.form.type)) {
          appendProps.push('options')
        }
        if (['cascader'].includes(column.form.type)) {
          result.props = column.form.props
          excludeProps.push('props')
        }
        if (!this.getEditable(column, scope)) {
          result.disabled = true
        }
        const props = ['width', 'rules', 'events', ...appendProps]
        for (const prop of props) {
          if (result.hasOwnProperty(prop) && !excludeProps.includes(prop)) {
            delete result[prop]
          }
        }
      }
      return result
    },
    async getData() {
      this.loading = true
      const { page = false, params = {}, method } = this.queryApi
      if (
        typeof page === 'boolean' &&
        typeof params === 'object' &&
        typeof method === 'function'
      ) {
        const newParams = page ? {
          [this.defaultAttrs.global.propName.currentPage]: this.currentPage,
          [this.defaultAttrs.global.propName.pageSize]: this.pageSize || this.defaultAttrs?.global?.pageSizes[0],
          ...params
        } : params
        const callback = ({ data = [], total = 0 }) => {
          if (!Array.isArray(data)) {
            data = []
          }
          if (typeof total !== 'number') {
            total = 0
          }
          if (data.length === 0 && this.currentPage > 1) {
            --this.currentPage
          } else {
            this.data = data
            this.total = total
          }
          this.loading = false
          this.currentEditable = null
        }
        method(newParams, callback)
      }
    },
    getIndex(index) {
      return this.loading ? '' : ++index + (this.pageSize || this.defaultAttrs?.global?.pageSizes[0]) * (this.currentPage - 1)
    },
    getEditable(column, scope) {
      return typeof column.editable === 'function' ? column.editable(scope.row, scope.column, scope.row[column.prop], scope.$index) : true
    },
    clearEditable() {
      this.currentEditable = null
    },
    onSetPage(type, val) {
      if (type === 'size') {
        this.pageSize = val
      } else if (type === 'current') {
        this.currentPage = val
      }
    },
    onFocusEditable(prop, index) {
      this.currentEditable = prop + index
      this.$nextTick(() => {
        if (this.$refs.editable && this.$refs.editable.length > 0) {
          const el = this.$refs.editable[this.$refs.editable.length - 1]
          if (el && el.focus) {
            el.focus()
          }
        }
      })
    },
    onValidateForm(prop, valid) {
      this.$set(this.validateProp, prop, valid)
    },
    onChangeEditable(item, value, prop, index) {
      setTimeout(() => {
        const valid = this.validateProp[`list.${index}.${prop}`]
        this.$emit('cell-editable', { data: this.data, item, value, prop, index, valid })
      })
    },
    onSetEditable(type, val) {
      if (type === 'create') {
        this.data.push({ ...val, $isEditable: true })
        this.currentEditable = null
      } else if (type === 'cancel') {
        this.data.splice(val, 1)
      }
    },
    onSortable(params = {}) {
      document.body.ondrop = e => {
        e.preventDefault()
        e.stopPropagation()
      }
      const sortable = require('sortablejs').default
      const tbody = this.$refs.table.$el.querySelector('.el-table__body-wrapper tbody')
      const _this = this
      sortable.create(tbody, {
        animation: 150,
        ...params,
        onStart(event) {
          if (typeof params.onEnd === 'function') {
            params.onStart(event)
          }
          const item = _this.data[event.oldIndex]
          _this.$emit('row-drag-start', { data: _this.data, item, event })
        },
        onMove(event) {
          if (typeof params.onEnd === 'function') {
            params.onMove(event)
          }
          const item = _this.data[event.oldIndex]
          _this.$emit('row-drag-move', { data: _this.data, item, event })
        },
        onEnd(event) {
          if (typeof params.onEnd === 'function') {
            params.onEnd(event)
          }
          const { newIndex, oldIndex } = event
          const currRow = _this.data.splice(oldIndex, 1)[0]
          _this.data.splice(newIndex, 0, currRow)
          _this.$emit('row-drag-end', { data: _this.data, item: currRow, event })
        }
      })
    },
    onTableMethod(method, params = []) {
      this.$refs.table[method](...params)
    }
  }
}
</script>
