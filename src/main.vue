<template>
  <div class="table-model-wrap" v-loading="loading">

    <!-- table component -->
    <div class="table-model-content">
      <el-form
        ref="form"
        :model="formModel"
        @validate="onValidateForm"
      >
        <el-table
          ref="table"
          :data="data"
          :class="{ 'drag-sort': rowDragSort }"
          v-bind="getAttrs('table')"
          v-on="$listeners"
        >

          <!-- table column -->
          <el-table-model-column
            v-for="(column, index) in columns.filter(column => !column.hidden)"
            :key="`${(column.prop || column.type || 'column')}.${index}.0`"
            :column="column"
            :index="index"
            :level="1"
            :editable-key="editableKey"
            :get-attrs="getAttrs"
          >
            <template
              v-for="(value, name) in $scopedSlots"
              v-slot:[name]="params"
            >
              <slot
                :name="name"
                v-bind="params"
              />
            </template>
          </el-table-model-column>

          <!-- append slot -->
          <template v-slot:append>
            <slot
              v-if="$scopedSlots.append"
              name="append"
              :refs="{
                form: $refs.form,
                table: $refs.table
              }"
            />
          </template>

          <!-- empty slot -->
          <template v-slot:empty>
            <slot
              v-if="$scopedSlots.empty"
              name="empty"
              :refs="{
                form: $refs.form,
                table: $refs.table
              }"
            />
          </template>

        </el-table>
      </el-form>
    </div>

    <!-- between slot -->
    <div
      v-if="$scopedSlots.between"
      class="table-model-between"
    >
      <slot
        name="between"
        :refs="{
          form: $refs.form,
          table: $refs.table
        }"
      />
    </div>

    <!-- pagination component -->
    <div
      v-if="hasData && queryApi.page"
      class="table-model-pagination"
    >
      <el-pagination
        :page-size="pageSize"
        :current-page="currentPage"
        :total="total"
        v-bind="getAttrs('pagination')"
        @size-change="onTurnPage('size', $event)"
        @current-change="onTurnPage('current', $event)"
      />
    </div>

  </div>
</template>

<script>
import { debounce } from 'debounce'
import Utils from './utils.js'
import ElTableModelColumn from './components/column.vue'

export default {
  name: 'ElTableModel',
  components: {
    ElTableModelColumn
  },
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
    pagination: {
      type: Object,
      required: false,
      default: () => ({})
    },
    activatedRefresh: {
      type: [Boolean, undefined],
      required: false,
      default: undefined
    },
    rowDragSort: {
      type: [Boolean, Object, Function],
      required: false,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      data: [],
      pageSize: 0,
      currentPage: 1,
      total: 0,
      validateProp: {},
      editableKey: '',
      getDataFunc: debounce(this.getData, 200)
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
        const { page: queryPage } = this.queryApi
        if (
          nVal.currentPage > 1 &&
          nVal.currentPage === oVal.currentPage &&
          queryPage === true
        ) {
          this.currentPage = 1
        } else {
          this.loading = true
          this.getDataFunc()
        }
      },
      immediate: false,
      deep: true
    }
  },
  created() {
    const { immediate: queryImmediate } = this.queryApi
    if (queryImmediate === true) {
      this.loading = true
      this.getDataFunc()
    }
  },
  activated() {
    const { immediate: queryImmediate } = this.queryApi
    if (
      queryImmediate === true &&
      this.activatedRefresh !== false &&
      (this.activatedRefresh || this.defaultAttrs.global.activatedRefresh)
    ) {
      this.loading = true
      this.getDataFunc()
    }
  },
  mounted() {
    if (this.rowDragSort === true) {
      this.onSortable()
    } else if (Utils.getPrototype(this.rowDragSort) === 'object') {
      const params = this.rowDragSort
      this.onSortable(params)
    } else if (Utils.getPrototype(this.rowDragSort).indexOf('function') !== -1) {
      const params = this.rowDragSort({ ref: this.$refs.table })
      this.onSortable(params)
    }
  },
  methods: {
    getIndex(index) {
      return !this.loading
        ? ++index + (this.pageSize || this.getAttrs('pagination').pageSizes[0]) * (this.currentPage - 1)
        : ''
    },
    getAttrs(type, options) {
      let result = {}
      if (type === 'table') {
        result = {
          ...(
            Utils.getPrototype(this.defaultAttrs.component.table).indexOf('function') !== -1
              ? this.defaultAttrs.component.table(this)
              : this.defaultAttrs.component.table
          ),
          ...this.getProps(this.$attrs, this.defaultAttrs.ui.Table)
        }
      } else if (type === 'table-column') {
        const { column } = options
        result = {
          ...(
            Utils.getPrototype(this.defaultAttrs.component.tableColumn).indexOf('function') !== -1
              ? this.defaultAttrs.component.tableColumn(this, column)
              : this.defaultAttrs.component.tableColumn
          ),
          index: column.type === 'index' ? this.getIndex : null,
          ...this.getProps(column, this.defaultAttrs.ui.TableColumn)
        }
      } else if (type === 'editable-form') {
        const { column, form } = options
        result = {
          size: 'mini',
          placeholder: column.label || '',
          ...this.getProps(form, {
            input: this.defaultAttrs.ui.Input,
            text: this.defaultAttrs.ui.Input,
            number: this.defaultAttrs.ui.Input,
            password: this.defaultAttrs.ui.Input,
            tel: this.defaultAttrs.ui.Input,
            email: this.defaultAttrs.ui.Input,
            url: this.defaultAttrs.ui.Input,
            search: this.defaultAttrs.ui.Input,
            textarea: this.defaultAttrs.ui.Input,
            autocomplete: this.defaultAttrs.ui.Autocomplete,
            count: this.defaultAttrs.ui.InputNumber,
            select: this.defaultAttrs.ui.Select,
            cascader: this.defaultAttrs.ui.Cascader,
            time: this.defaultAttrs.ui.TimePicker,
            date: this.defaultAttrs.ui.DatePicker,
            dates: this.defaultAttrs.ui.DatePicker,
            datetime: this.defaultAttrs.ui.DatePicker,
            month: this.defaultAttrs.ui.DatePicker,
            year: this.defaultAttrs.ui.DatePicker,
            daterange: this.defaultAttrs.ui.DatePicker,
            datetimerange: this.defaultAttrs.ui.DatePicker,
            monthrange: this.defaultAttrs.ui.DatePicker,
            radio: this.defaultAttrs.ui.RadioGroup,
            checkbox: this.defaultAttrs.ui.CheckboxGroup,
            switch: this.defaultAttrs.ui.Switch,
            slider: this.defaultAttrs.ui.Slider,
            rate: this.defaultAttrs.ui.Rate,
            color: this.defaultAttrs.ui.ColorPicker
          }[form.type])
        }
      } else if (type === 'pagination') {
        result = {
          layout: 'total, sizes, prev, pager, next, jumper',
          ...(
            Utils.getPrototype(this.defaultAttrs.component.pagination).indexOf('function') !== -1
              ? this.defaultAttrs.component.pagination(this)
              : this.defaultAttrs.component.pagination
          ),
          ...this.getProps(this.pagination, this.defaultAttrs.ui.Pagination)
        }
      }
      return result
    },
    getProps(item, component) {
      let result = {}
      if (component && component.props && typeof component.props === 'object') {
        let props = Object.keys(component.props)
        if (['ElInput', 'ElAutocomplete'].includes(component.name)) {
          props.push(...['maxlength', 'minlength', 'autocomplete', 'name', 'readonly', 'max', 'min', 'step', 'autofocus', 'form'])
        }
        if (['ElInputNumber', 'ElTimePicker', 'ElDatePicker', 'ElCheckboxGroup', 'ElRadioGroup'].includes(component.name)) {
          props.push('name')
        }
        if (component.mixins && Array.isArray(component.mixins)) {
          for (const mixin of component.mixins) {
            if (mixin && mixin.props && typeof mixin.props === 'object') {
              props.push(...Object.keys(mixin.props))
            }
          }
        }
        props = Array.from(new Set(props))
        for (const prop in item) {
          if (props.includes(Utils.convertHumpStr(prop)) || prop.split('-')[0] === 'data') {
            result[prop] = item[prop]
          }
        }
      } else {
        result = { ...item }
      }
      return result
    },
    async getData() {
      this.loading = true
      const {
        page: queryPage = false,
        params: queryParams = {},
        method: queryMethod
      } = this.queryApi
      if (
        Utils.getPrototype(queryPage) !== 'boolean' ||
        Utils.getPrototype(queryParams) !== 'object' ||
        Utils.getPrototype(queryMethod).indexOf('function') === -1
      ) {
        return
      }
      if (queryPage) {
        queryParams[this.defaultAttrs.global.propName.currentPage] = this.currentPage
        queryParams[this.defaultAttrs.global.propName.pageSize] = this.pageSize || this.getAttrs('pagination').pageSizes[0]
      }
      const queryCallback = (result) => {
        if (Utils.getPrototype(result) !== 'object') {
          result = { data: [], total: 0 }
        }
        if (Utils.getPrototype(result.data) !== 'array') {
          result.data = []
        }
        if (Utils.getPrototype(result.total) !== 'number') {
          result.total = 0
        }
        if (result.data.length === 0 && this.currentPage > 1) {
          --this.currentPage
        } else {
          this.data = result.data
          this.total = result.total
        }
        this.loading = false
        this.editableKey = `editable.key.${+new Date()}`
      }
      queryMethod(queryParams, queryCallback)
    },
    onValidateForm(prop, valid) {
      this.$set(this.validateProp, prop, valid)
    },
    onTurnPage(type, val) {
      if (type === 'size') {
        this.pageSize = val
      } else if (type === 'current') {
        this.currentPage = val
      }
    },
    onSortable(options = {}) {
      document.body.ondrop = e => {
        e.preventDefault()
        e.stopPropagation()
      }
      const sortable = require('sortablejs').default
      const tbody = this.$refs.table.$el.querySelector('.el-table__body-wrapper tbody')
      sortable.create(tbody, {
        animation: 150,
        ...options,
        onStart: (event) => {
          const row = this.data[event.oldIndex]
          const params = { data: this.data, row, event }
          Object.setPrototypeOf(params, { item: row })
          this.$emit('row-drag-start', params)
          if (Utils.getPrototype(options.onStart).indexOf('function') !== -1) {
            options.onStart(event)
          }
        },
        onMove: (event) => {
          const params = { data: this.data, event }
          this.$emit('row-drag-move', params)
          if (Utils.getPrototype(options.onMove).indexOf('function') !== -1) {
            options.onMove(event)
          }
        },
        onEnd: (event) => {
          const { newIndex, oldIndex } = event
          const row = this.data.splice(oldIndex, 1)[0]
          const params = { data: this.data, row, event }
          Object.setPrototypeOf(params, { item: row })
          this.data.splice(newIndex, 0, row)
          this.$emit('row-drag-end', params)
          if (Utils.getPrototype(options.onEnd).indexOf('function') !== -1) {
            options.onEnd(event)
          }
        }
      })
    },
    onTableMethod(method, params = []) {
      this.$refs.table[method](...params)
    }
  }
}
</script>
