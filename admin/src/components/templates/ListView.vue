<template>
  <div>
    <el-table :data="list"
              v-loading.body="isLoading"
              border
              stripe
              max-height="570"
              style="width: 100%">
    <el-table-column fixed="left" type="index" width="60" label="序号" ></el-table-column>
    <el-table-column v-if="item.prop != 'tag'"
       v-for="(item, index) in options.labels" :key="index"
       :prop="item.prop"
       :label="item.label"
    ></el-table-column>
    <el-table-column
        v-if="hasTag"
        prop="cate"
        label="分类"
        min-width="60"
        >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.cate">{{ scope.row.cate.name }}</el-tag>
        </template>
    </el-table-column>
    <el-table-column
        v-if="hasTag"
        prop="tag"
        label="标签"
        :filters="filters"
        :filter-method="filterHandler"
        min-width="160"
        >
        <template slot-scope="scope">
          <el-tag v-for="(tagItem, index) in scope.row.tag" :key="index"
                  type="success"
          >{{ tagItem.name }}</el-tag>
        </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="200">
      <template slot-scope="scope">
        <el-button
          size="mini"
          @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
        <el-button
          size="mini"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    options: {
      required: true,
      default() {
        return {}
      }
    }
  },
  data() {
    let model = this.options.model
    let hasTag = model === 'post'
    return {
      isLoading: true,
      hasTag: hasTag
    }
  },
  created() {
    this.getList(this.options).then((e) => {
      this.isLoading = false
      if (e instanceof Error) {
        this.$message({
          type: 'error',
          message: '获取数据失败!'
        })
      }
    })
  },
  computed: {
    filters() {
      let obj = this.list.reduce((prev, value) => {
        value.tag && value.tag.forEach((el, i) => {
          prev[el.name] = {
            text: el.name,
            value: el.name
          }
        })
        return prev
      }, {})
      return Object.keys(obj).map((key) => {
        return obj[key]
      })
    },
    ...mapGetters(['list'])
  },
  methods: {
    filterHandler(value, row, column) {
      return row[column.property].some(item => {
        console.log(item)
        return item['name'] === value
      })
    },
    handleDelete(index, row) {
      this.$confirm('删了就回不来了, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._handleDelete(index, row)
      })
    },
    handleEdit(index, { id }) {
      this.$router.push({
        path: `/${this.options.model}/create/${id}`
      })
    },
    _handleDelete(index, { id }) {
      this.delItem(
        {
          query: {
            id: id
          },
          model: this.options.model
        }
      ).then(e => {
        console.log(e)
        if (e instanceof Error) {
          this.$message({
            type: 'error',
            message: '删除失败！'
          })
        } else {
          this.$message({
            type: 'success',
            message: '删除成功！！'
          })
        }
      })
    },
    ...mapActions({
      getList: 'GET_LIST',
      delItem: 'DELETE_LIST_ITEM'
    })
  }
}
</script>
