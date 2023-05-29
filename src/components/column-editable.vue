<template>
  <el-form-item
    v-if="form"
    :prop="`list.${scope.$index}.${column.prop}`"
    :rules="form.rules"
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
        }[form.type]"
        ref="editable"
        class="el-editable-form"
        :style="{ width: form.width }"
        v-model.trim="scope.row[column.prop]"
        v-bind="getAttrs('editable-form', { column, scope, form })"
        v-on="form.events"
      >
        <template v-if="form.type === 'select' && form.options">
          <el-option
            v-for="(option, optionsIndex) in form.options"
            :key="optionsIndex"
            v-bind="option"
          >
            <span>{{ option.label }}</span>
          </el-option>
        </template>
      </component>
    </span>
  </el-form-item>
</template>

<script>
import Utils from '../utils.js'

export default {
  name: 'ElTableModelColumnEditable',
  props: {
    column: {
      type: Object,
      required: true,
      default: () => ({})
    },
    scope: {
      type: Object,
      required: true,
      default: () => ({})
    },
    getAttrs: {
      type: Function,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      form: null
    }
  },
  created() {
    const { row, column, $index } = this.scope
    const form = Utils.getPrototype(this.column.editableForm).indexOf('function') !== -1
      ? this.column.editableForm(row, column, row[column.property], $index)
      : this.column.editableForm
    if (Utils.getPrototype(form) === 'object') {
      this.form = form
    }
  }
}
</script>
