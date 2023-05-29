<template>
  <el-table-column v-bind="getAttrs('table-column', { column })">

    <!-- children recursion -->
    <template v-if="column.children">
      <el-table-model-column
        v-for="(column, index) in column.children.filter(column => !column.hidden)"
        :key="(column.prop || column.type || column.label) + index"
        :column="column"
        :index="index"
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
    </template>

    <!-- header slot -->
    <template
      v-if="!column.children"
      v-slot:header="scope"
    >
      <slot
        v-if="column.headerSlot"
        :name="column.headerSlot"
        :index="scope.$index"
        :column="scope.column"
      />
      <span v-else>{{ scope.column.label }}</span>
    </template>

    <!-- body slot -->
    <template
      v-if="!column.children && ['render', 'slot', 'expand', 'editable'].includes(column.type)"
      v-slot="scope"
    >

      <!-- render type -->
      <render
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
      <editable
        v-if="column.type === 'editable'"
        :key="editableKey"
        :column="column"
        :scope="scope"
        :get-attrs="getAttrs"
      />

    </template>

  </el-table-column>
</template>

<script>
import ElTableModelColumnRender from './column-render.vue'
import ElTableModelColumnEditable from './column-editable.vue'

export default {
  name: 'ElTableModelColumn',
  components: {
    Render: ElTableModelColumnRender,
    Editable: ElTableModelColumnEditable
  },
  props: {
    column: {
      type: Object,
      required: true,
      default: () => ({})
    },
    index: {
      type: Number,
      required: true,
      default: 0
    },
    editableKey: {
      type: String,
      required: false,
      default: ''
    },
    getAttrs: {
      type: Function,
      required: true,
      default: () => ({})
    }
  }
}
</script>
