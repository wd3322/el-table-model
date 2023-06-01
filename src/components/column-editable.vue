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
          number: 'el-input',
          password: 'el-input',
          tel: 'el-input',
          email: 'el-input',
          url: 'el-input',
          search: 'el-input',
          textarea: 'el-input',
          autocomplete: 'el-autocomplete',
          count: 'el-input-number',
          select: 'el-select',
          cascader: 'el-cascader',
          time: 'el-time-picker',
          date: 'el-date-picker',
          dates: 'el-date-picker',
          datetime: 'el-date-picker',
          month: 'el-date-picker',
          year: 'el-date-picker',
          daterange: 'el-date-picker',
          datetimerange: 'el-date-picker',
          monthrange: 'el-date-picker',
          radio: 'el-radio-group',
          checkbox: 'el-checkbox-group',
          switch: 'el-switch',
          slider: 'el-slider',
          rate: 'el-rate',
          color: 'el-color-picker'
        }[form.type]"
        ref="editable"
        class="el-editable-form"
        :style="{ width: form.width }"
        v-model="scope.row[column.prop]"
        v-bind="getAttrs('editable-form', { column, scope, form })"
        v-on="form.events"
      >
        <template v-if="['select', 'radio', 'checkbox'].includes(form.type) && form.options">
          <component
            :is="{
              select: 'el-option',
              radio: 'el-radio',
              checkbox: 'el-checkbox'
            }[form.type]"
            v-for="(option, optionIndex) in form.options.filter(item => !item.hidden)"
            :key="`list.${scope.$index}.${column.prop}.${option.value}.${optionIndex}`"
            v-bind="{
              ...option,
              label: form.type === 'select' ? option.label : option.value,
              value: form.type === 'select' ? option.value : null
            }"
          >
            {{ option.label }}
          </component>
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
