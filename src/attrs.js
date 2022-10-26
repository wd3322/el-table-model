
const attrs = {
  global: {
    propName: {
      currentPage: 'currentPage',
      pageSize: 'pageSize'
    }
  },
  component: {
    table: {
      border: true,
      highlightCurrentRow: true
    },
    tableColumn(column) {
      if (column.type === 'index') {
        return {
          width: 60
        }
      } else {
        return {}
      }
    },
    pagination: {
      pageSizes: [20, 50, 100]
    }
  }
}

const get = ({ global, component }) => {
  return {
    data () {
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