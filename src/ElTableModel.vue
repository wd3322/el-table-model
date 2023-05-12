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
          <template v-for="(column, index) in columns.filter(column => !column.hidden)">

            <el-table-column
              :key="(column.prop || column.type) + index"
              v-bind="getAttrs('table-column', column)"
            >

              <!-- header slot -->
              <template v-slot:header="scope">
                <slot
                  v-if="column.headerSlot"
                  :name="column.headerSlot"
                  :index="scope.$index"
                  :column="scope.column"
                />
                <span v-else>{{ scope.column.label }}</span>
              </template>

              <!-- body slot -->
              <template v-slot="scope" v-if="['render', 'slot', 'expand', 'editable'].includes(column.type)">

                <!-- render type -->
                <el-table-model-column
                  v-if="column.type === 'render'"
                  :render-content="column.renderContent"
                  :row="scope.row"
                  :column="scope.column"
                  :index="scope.$index"
                  :value="scope.row[column.prop]"
                />

                <!-- slot type -->
                <slot
                  v-else-if="column.type === 'slot'"
                  :name="column.defaultSlot || column.prop"
                  :item="scope.row"
                  :row="scope.row"
                  :column="scope.column"
                  :index="scope.$index"
                  :value="scope.row[column.prop]"
                  :format="typeof column.formatter === 'function' ? column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) : null"
                  :refs="{
                    form: $refs.form,
                    table: $refs.table
                  }"
                />

                <!-- expand type -->
                <slot
                  v-else-if="column.type === 'expand'"
                  name="expand"
                  :index="scope.$index"
                  :row="scope.row"
                  :column="scope.column"
                />

                <!-- editable type -->
                <div v-else-if="column.type === 'editable'">
                  <!-- form-item -->
                  <span v-if="currentEditable === column.prop + scope.$index || scope.row.$isEditable || validateProp[`list.${scope.$index}.${column.prop}`] === false">
                    <el-form-item
                      :prop="`list.${scope.$index}.${column.prop}`"
                      :rules="column.form.rules"
                      :row-index="scope.$index"
                    >
                      <!-- component-item -->
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
                          @change="onChangeEditable(scope.row, scope.column, scope.row[column.prop], scope.$index, column.prop)"
                          @select="onChangeEditable(scope.row, scope.column, scope.row[column.prop], scope.$index, column.prop)"
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
                  <!-- text-item -->
                  <span
                    v-else
                    :class="getEditable('state', column, scope) ? 'editable-text' : 'uneditable-text'"
                    @click.stop="onFocusEditable(scope.row, scope.column, scope.row[column.prop], scope.$index, column.prop)"
                  >
                    {{ getEditable('value', column, scope) }}
                  </span>
                </div>

              </template>

            </el-table-column>

          </template>

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

        </el-table>
      </el-form>
    </div>

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

    <div
      v-if="hasData && queryApi.page"
      class="table-model-pagination"
    >
      <el-pagination
        :page-size="pageSize"
        :current-page="currentPage"
        :total="total"
        v-bind="getAttrs('pagination')"
        @size-change="onSetPage('size', $event)"
        @current-change="onSetPage('current', $event)"
      />
    </div>
  </div>
</template>

<script>
import { debounce } from 'debounce'
import Utils from './utils.js'
import ElTableModelColumn from './components/ElTableModelColumn.vue'

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
      currentEditable: '',
      validateProp: {},
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
    } else if (['function', 'asyncfunction'].includes(Utils.getPrototype(this.rowDragSort))) {
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
          ...(
            ['function', 'asyncfunction'].includes(Utils.getPrototype(this.defaultAttrs.component.table))
              ? this.defaultAttrs.component.table(this)
              : this.defaultAttrs.component.table
          ),
          ...this.$attrs
        }
      } else if (type === 'table-column') {
        result = {
          ...(
            ['function', 'asyncfunction'].includes(Utils.getPrototype(this.defaultAttrs.component.tableColumn))
              ? this.defaultAttrs.component.tableColumn(this, column)
              : this.defaultAttrs.component.tableColumn
          ),
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
        if (!this.getEditable('state', column, scope)) {
          result.disabled = true
        }
        const props = ['width', 'rules', 'events', ...appendProps]
        for (const prop of props) {
          if (result.hasOwnProperty(prop) && !excludeProps.includes(prop)) {
            delete result[prop]
          }
        }
      } else if (type === 'pagination') {
        result = {
          layout: 'total, sizes, prev, pager, next, jumper',
          ...(
            ['function', 'asyncfunction'].includes(Utils.getPrototype(this.defaultAttrs.component.pagination))
              ? this.defaultAttrs.component.pagination(this)
              : this.defaultAttrs.component.pagination
          ),
          ...this.pagination
        }
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
        !['function', 'asyncfunction'].includes(Utils.getPrototype(queryMethod))
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
        this.currentEditable = null
      }
      queryMethod(queryParams, queryCallback)
    },
    getIndex(index) {
      return !this.loading
        ? ++index + (this.pageSize || this.getAttrs('pagination').pageSizes[0]) * (this.currentPage - 1)
        : ''
    },
    getEditable(type, column, scope) {
      if (type === 'state') {
        return ['function', 'asyncfunction'].includes(Utils.getPrototype(column.editable))
          ? column.editable(scope.row, scope.column, scope.row[column.prop], scope.$index)
          : true
      } else if (type === 'value') {
        return ['function', 'asyncfunction'].includes(Utils.getPrototype(column.formatter))
          ? column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index)
          : scope.row[column.prop]
      }
    },
    clearEditable() {
      this.currentEditable = null
    },
    onFocusEditable(row, column, value, index, prop) {
      this.currentEditable = prop + index
      this.$nextTick(() => {
        if (this.$refs.editable && this.$refs.editable.length > 0) {
          const el = this.$refs.editable[this.$refs.editable.length - 1]
          if (el) {
            el.focus && el.focus()
            const params = { data: this.data, column, row, value, index, prop, el: el.$el }
            Object.setPrototypeOf(params, { item: row })
            this.$emit('cell-editable-focus', params)
          }
        }
      })
    },
    onChangeEditable(row, column, value, index, prop) {
      setTimeout(() => {
        const valid = this.validateProp[`list.${index}.${prop}`]
        const params = { data: this.data, column, row, value, index, prop, valid }
        Object.setPrototypeOf(params, { item: row })
        this.$emit('cell-editable-change', params)
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
    onValidateForm(prop, valid) {
      this.$set(this.validateProp, prop, valid)
    },
    onSetPage(type, val) {
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
          if (['function', 'asyncfunction'].includes(Utils.getPrototype(options.onStart))) {
            options.onStart(event)
          }
        },
        onMove: (event) => {
          const params = { data: this.data, event }
          this.$emit('row-drag-move', params)
          if (['function', 'asyncfunction'].includes(Utils.getPrototype(options.onMove))) {
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
          if (['function', 'asyncfunction'].includes(Utils.getPrototype(options.onEnd))) {
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
