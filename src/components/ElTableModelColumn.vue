<script>
export default {
  name: 'ElTableModelColumn',
  props: {
    row: {
      type: Object,
      required: true,
      default: () => ({})
    },
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
    value: {
      required: false,
      default: ''
    },
    renderContent: {
      type: Function,
      required: true,
      default: () => {}
    }
  },
  render(createElement) {
    return this.renderContent(createElement, {
      row: this.row,
      column: this.column,
      index: this.index,
      value: this.value
    })
  }
}
</script>
