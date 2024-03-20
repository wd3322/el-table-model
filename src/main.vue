<template>
  <div class="table-model-wrap">

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
      v-if="pagination && pagination.total"
      class="table-model-pagination"
    >
      <el-pagination
        v-bind="getAttrs('pagination')"
        v-on="pagination.events"
      />
    </div>

  </div>
</template>

<script>
import Utils from './utils.js'
import ElTableModelColumn from './components/column.vue'

export default {
  name: 'ElTableModel',
  components: {
    ElTableModelColumn
  },
  props: {
    data: {
      type: Array,
      required: true,
      default: () => [{}]
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
    rowDragSort: {
      type: [Boolean, Object, Function],
      required: false,
      default: false
    }
  },
  data() {
    return {
      validateProp: {},
      editableKey: ''
    }
  },
  computed: {
    formModel() {
      return {
        list: this.data
      }
    }
  },
  created() {
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
      return this.pagination.pageSize && this.pagination.currentPage
        ? ++index + (this.pagination.pageSize || this.getAttrs('pagination').pageSizes[0]) * (this.pagination.currentPage - 1)
        : ++index
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
        props = props.filter((prop, index) => props.indexOf(prop) === index)
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
    onValidateForm(prop, valid) {
      this.$set(this.validateProp, prop, valid)
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
