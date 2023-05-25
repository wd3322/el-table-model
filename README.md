# Vue Element Table To Json

### Git地址

[Github](https://github.com/wd3322/el-table-model)

[Gitee](https://gitee.com/wd3322/el-table-model)

![el-table-model](https://wd3322.gitee.io/to-vue3/img/el-table-model/table-demo.png)

### 渲染
![base](https://wd3322.gitee.io/to-vue3/img/el-table-model/table-base.gif)

### 可编辑
![editable](https://wd3322.gitee.io/to-vue3/img/el-table-model/table-editable.gif)

### 可拖动
![draggable](https://wd3322.gitee.io/to-vue3/img/el-table-model/table-draggable.gif)

---

## 下载

```
npm install el-table-model
```

---

## 引用
在 main.js 中写入以下内容，请使用 `element-ui v2.15.X` 以上版本

```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import ElTableModel from 'el-table-model'
import 'element-ui/lib/theme-chalk/index.css'
import 'el-table-model/lib/index.css'

Vue.use(ElementUI)
Vue.use(ElTableModel)
```

---

### 引用-默认参数（可选）

```javascript
Vue.use(ElTableModel, {
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
        size: 'medium',
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
})
```

---

# 组件

### 组件-基础
创建第一个 `el-table-model` 实例

```html
<template>
  <el-table-model
    ref="myTable"
    :query-api="queryApi"
    :columns="columns"
    :pagination="pagination"
    :activated-refresh="activatedRefresh"
  />
</template>
```

```javascript
export default {
  data() {
    return {
      queryApi: { // 请求API，详见请求章节
        immediate: true,
        method: (params, callback) => {
          callback({ 
            data: [
              { id: 1, title: 'baidu', url: 'www.baidu.com' },
              { id: 2, title: 'google', url: 'www.google.com' }
            ],
            total: 2
          })
        }
      }, 
      columns: [{ // 表格数据列，详见数据章节
        label: '标题',
        prop: 'title'
      }, {
        label: '地址',
        prop: 'url'
      }],
      pagination: { // 可继承pagination属性，不包含currentPage、pageSize、total参数
        background: true,
        pageSizes: [5, 10, 20]
      },
      activatedRefresh: false, // 缓存激活时刷新
    }
  }
}
```

| Prop                | Prop Type  | Type     | Required |
| :-------            | :-------   | :------- | :------  |
| query-api           | Attribute  | Object   | True     |
| columns             | Attribute  | Array    | True     |
| pagination          | Attribute  | Object   | False    |
| activated-refresh   | Attribute  | Boolean  | False    |

---

### 组件-继承表格属性
可继承 `Table` 表格组件属性（Element Table Attributes）

```html
<template>
  <el-table-model
    ref="myTable"
    size="small"
    row-key="id"
    :border="true"
    :stripe="true"
    :max-height="500"
    :highlight-current-row="true"
    :query-api="queryApi"
    :columns="columns"
  />
</template>
```

---

### 组件-继承表格事件
可继承 `Table` 表格组件事件（Element Table Events）

```html
<template>
  <el-table-model
    ref="myTable"
    :query-api="queryApi"
    :columns="columns"
    @selection-change="onSelectionChange"
    @row-dblclick="onRowDblclick"
    @expand-change="onExpandChange"
  />
</template>
```

---

### 组件-执行表格事件
可执行 `Table` 表单组件方法（Element Table Methods）

```javascript
export default {
  methods: {
    setTable() {
      this.$refs.myTable.onTableMethod('toggleRowSelection', [arg1, arg2])
    }
  }
}
```
或
```javascript
export default {
  methods: {
    setTable() {
      this.$refs.myTable.$refs.table.toggleRowSelection(arg1, arg2)
    }
  }
}
```

---

# 请求

### 请求-静态数据
通过 `method` 方法中的 `callback` 方法返回给组件列表数据

```javascript
export default {
  data() {
    return {
      queryApi: {
        immediate: true, // 立即执行
        method: (params, callback) => {
          callback({ 
            data: [
              { id: 1, title: 'baidu', url: 'www.baidu.com' },
              { id: 2, title: 'google', url: 'www.google.com' }
            ],
            total: 2
          })
        }
      }
    }
  }
}
```

---

### 请求-动态数据
通过 `method` 方法中的 `callback` 方法返回给组件列表数据

```javascript
export default {
  data() {
    return {
      queryApi: {
        immediate: true, // 立即执行
        page: true, // 开启分页
        params: { // 请求参数
          id: 1
        },
        method: async(params, callback) => {
          // params is { id: 1, currentPage: 1, pageSize: 20 }
          const res = await this.$api.getList(params) 
          if (res) {
            callback({ 
              data: res.data,
              total: res.total
            })
          }
        }
      }
    }
  }
}
```

---

### 请求-主动执行
当执行 `ref.getData()` 方法时，组件会执行 `queryApi.method` 方法

```javascript
export default {
  methods: {
    getData() {
      this.$refs.myTable.getData()
    }
  }
}
```

---

### 请求-后续执行
当 `queryApi.immediate` 属性从初始化的 `false` 变更为 `true` 时，组件会执行 `queryApi.method` 方法

```javascript
export default {
  methods: {
    setImmediate() {
      this.queryApi.immediate = true
    }
  }
}
```

---

### 请求-修改参数
当 `queryApi.params` 属性中的参数发生变更时，组件会自动执行 `queryApi.method` 方法

```javascript
export default {
  methods: {
    setParams() {
      this.queryApi.params.id = 2
    }
  }
}
```

---

# 数据

### 数据-类型
可通过 `type` 属性设置表格列类型，当 `type` 属性为空时，将指向其 `prop` 属性值对应展示的数据字段名

```javascript
export default {
  data() {
    return {
      columns: [{
        type: 'expand'
      }, {
        type: 'selection'
      }, {
        label: '序号',
        type: 'index'
      }, {
        label: '标题',
        prop: 'title'
      }, {
        label: '地址',
        prop: 'url'
      }]
    }
  }
}
```

---

### 数据-继承表格列属性
可继承 `Table-column` 表格列属性（Element Table-column Attributes）

```javascript
export default {
  data() {
    return {
      columns: [{
        label: '标题',
        prop: 'title',
        width: '200',
        fixed: 'left',
        className: 'title-class',
        sortable: true,
        showOverflowTooltip: true,
        formatter (row, column, value, index) {
          return 'formatter' + value
        }
      }]
    }
  }
}
```

---

### 数据-渲染
可通过 `type` 属性设置为 `'render'` 值，并使用 `renderContent` 属性创建渲染函数

```javascript
export default {
  data() {
    return {
      columns: [{
        label: '标题',
        prop: 'title',
        type: 'render',
        renderContent(h, { row, column, value, index }) {
          return h('span', {
            style: {
              color: '#333333',
              cursor: 'pointer'
            },
            on: {
              click: () => {
                console.log('renderContent', row, column, value, index)
              }
            }
          }, value)
        }
      }]
    }
  }
}
```

---

### 数据-插槽
可通过 `headerSlot` 属性设置自定义表头插槽内容，`type` 属性设置为 `'slot'` 值时，将优先指向其 `defaultSlot` 属性值的具名插槽，如若为空则指向 `prop` 属性值的具名插槽

```html
<template>
  <el-table-model
    ref="myTable"
    :query-api="queryApi"
    :columns="columns"
  >
    <template v-slot:customHeader="params">
      {{ params.column.label }} / 自定义表头内容
    </template>
    <template v-slot:customUrl="params">
      {{ params.value }} / 自定义数据内容
    </template>
    <template v-slot:customButton="params">
      <el-link>自定义按钮</el-link>
    </template>
    <template v-slot:expand="{ index, row }">
      展开行的内容
    </template>
    <template v-slot:append="{ tableRef }">
      插入至表格最后一行之后的内容
    </template>
    <template v-slot:between="{ tableRef }">
      表格与分页之间的内容
    </template>
  </el-table-model>
</template>
```

---

```javascript
export default {
  data() {
    return {
      queryApi: { ... },
      columns: [{
        type: 'expand'
      }, {
        label: '标题',
        prop: 'title',
        headerSlot: 'customHeader'
      }, {
        label: '地址',
        prop: 'url',
        defaultSlot: 'customUrl',
        type: 'slot'
      }, {
        label: '按钮',
        prop: 'customButton',
        type: 'slot'
      }]
    }
  }
  methods: {
    onAction(params) {
      console.log('onAction', params)
    }
  }
}
```

---

### 数据-可拖动
可通过 `row-drag-sort` 属性设置开启数据行拖拽排序功能，同时需设置 `row-key` 属性确保数据行的唯一性

```html
<template>
  <el-table-model
    ref="myTable"
    row-key="id"
    :query-api="queryApi"
    :columns="columns"
    :row-drag-sort="true"
    @row-drag-start="onRowDragStart"
    @row-drag-move="onRowDragMove"
    @row-drag-end="onRowDragEnd"
  />
</template>
```

---

```javascript
export default {
  data() {
    return {
      queryApi: { ... },
      columns: [ ... ]
    }
  }
  methods: {
    onRowDragStart(params) {
      console.log('onRowDragStart', params)
    },
    onRowDragMove(params) {
      console.log('onRowDragMove', params)
    },
    onRowDragEnd(params) {
      console.log('onRowDragEnd', params)
    }
  }
}
```

| Prop           | Prop Type    | Type                        | Required |
| :-------       | :-------     | :-------                    | :------  |
| row-drag-sort  | Attribute    | Boolean, Object, Function   | False    |
| row-drag-start | Event        | Function                    | False    |
| row-drag-move  | Event        | Function                    | False    |
| row-drag-end   | Event        | Function                    | False    |

---

### 数据-可拖动-继承Sortablejs选项
可通过 `row-drag-sort` 属性设置 `Sortablejs` 插件的扩展选项（Sortablejs Options）

```html
<template>
  <el-table-model
    ref="myTable"
    row-key="id"
    :query-api="queryApi"
    :columns="columns"
    :row-class-name="onRowClassName"
    :row-drag-sort="onRowDragSort"
  />
</template>
```

```javascript
export default {
  data() {
    return {
      queryApi: { ... },
      columns: [ ... ]
    }
  }
  methods: {
    onRowClassName({ row, rowIndex }) {
      return rowIndex === 0 ? 'drag-ignore-row' : ''
    },
    onRowDragSort({ ref }) {
      // sortablejs options: http://www.sortablejs.com/options.html
      return {
        animation: 300,
        filter: '.drag-ignore-row'
      }
    }
  }
}
```

---

### 数据-可编辑
可通过 `type` 属性设置 `'editable'` 值开启数据可编辑功能，在 `form` 属性中返回表单子项组件

```html
<template>
  <el-button
    type="primary"
    @click="onAddRow"
  >
    添加一行数据
  </el-button>
  <el-button
    type="primary"
    @click="onValidTable"
  >
    校验所有数据
  </el-button>
  <el-button
    type="primary"
    @click="onValidRow(0)"
  >
    校验单行数据
  </el-button>
  <el-table-model
    ref="myTable"
    :query-api="queryApi"
    :columns="columns"
  >
    <template v-slot:button="params">
      <el-button 
        size="mini"
        type="primary"
        click="onDelRow(params)"
      >
        按钮
      </el-button>
    </template>
  </el-table-model>
</template>
```

---

```javascript
export default {
  data() {
    return {
      tableData: [],
      queryApi: {
        immediate: true,
        method: (params, callback) => {
          const res = { 
            data: [
              { id: '1', myInput: 'apple', mySelect: 0 },
              { id: '2', myInput: 'banana', mySelect: 1 }
            ],
            total: 2
          }
          this.tableData = res.data
          callback(res)
        }
      },
      columns: [{
        label: '输入框',
        prop: 'myInput',
        type: 'editable',
        form: (row, column, value, index) => {
          return {
            type: 'input', // input,autocomplete,count,select,cascader,time,date,dates,datetime,month,year
            maxlength: 50,
            width: '100%',
            events: { // 继承表单元素事件
              change: val => {
                console.log('myInput change', val)
              }
            },
            rules: [ // 继承表单元素属性
              { required: true, message: '请输入...', trigger: 'blur' }
            ]
          }
        },
      }, {
        label: '下拉框',
        prop: 'mySelect',
        type: 'editable',
        form: (row, column, value, index) => {
          return {
            type: 'select',
            width: '100%',
            options: [
              { label: '选项1', value: 0 },
              { label: '选项2', value: 1 }
            ],
            rules: [
              { required: true, message: '请选择...', trigger: 'change' }
            ]
          }
        }
      }, {
        label: '按钮',
        prop: 'button',
        type: 'slot'
      }]
    }
  },
  methods: {
    onAddRow() {
      this.tableData.push({ myInput: 'apple', mySelect: 0 })
    },
    onDelRow(index) {
      this.tableData.splice(index, 1)
    },
    onValidTable() {
      this.$refs.myTable.$refs.form.validate((valid, object) => {
        console.log('valid table result:', valid)
      })
    },
    onValidRow(index) {
      this.$refs.myTable.$refs.form.validate((valid, object) => {
        if (object) {
          const objectKeys = Object.keys(object)
          const isValid = objectKeys.every(key => key.indexOf(`list.${index}.`) === -1)
          console.log('valid row result:', isValid)
        }
      })
    }
  }
}
```

----

Package: el-table-model

E-mail: diquick@qq.com

Author: wd3322
