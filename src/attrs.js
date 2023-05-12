
const attrs = {
  global: {
    activatedRefresh: false,
    propName: {
      currentPage: 'currentPage',
      pageSize: 'pageSize'
    }
  },
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
        pageSizes: [20, 50, 100]
      }
    }
  }
}

const get = ({ global, component }) => {
  return {
    data() {
      return {
        defaultAttrs: {
          global: {
            ...attrs.global,
            ...global
          },
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
