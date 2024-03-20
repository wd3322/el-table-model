
const attrs = {
  component: {
    table(ctx) {
      return {
        border: true,
        highlightCurrentRow: true
      }
    },
    tableColumn(ctx, column) {
      if (column.type === 'index') {
        return {
          width: 60
        }
      } else {
        return {}
      }
    },
    pagination(ctx) {
      return {
        pageSizes: [10, 20, 50, 100]
      }
    }
  }
}

const get = ({ ui, component }) => {
  return {
    data() {
      return {
        defaultAttrs: {
          ui,
          component: {
            ...attrs.component,
            ...component
          }
        }
      }
    }
  }
}

export default { get }
