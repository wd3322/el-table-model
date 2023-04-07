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
    value: {
      required: false,
      default: ''
    },
    index: {
      type: Number,
      required: true,
      default: 0
    },
    renderContent: {
      type: Function,
      required: true,
      default: () => {}
    }
  },
  render: function(createElement) {
    return this.renderContent(createElement, {
      row: this.row,
      column: this.column,
      value: this.value,
      index: this.index
    })
  }
}
</script>
