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
    return this.renderContent(createElement, this.row, this.column, this.value, this.index)
  }
}
</script>
