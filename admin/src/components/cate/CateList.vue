<template>
  <div class="cate">
    <el-table :data="cate"
              border
              stripe
              style="width: 100%">
    <el-table-column type="index" width="60" label="序号" ></el-table-column>
    <el-table-column prop="createdAt" label="创建日期" ></el-table-column>
    <el-table-column prop="name" label="标签名" ></el-table-column>
    <el-table-column fixed="right" label="操作" >
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
import { getCate, ERR_OK } from 'api'

export default {
  created() {
    this._getCate()
  },
  data() {
    return {
      cate: []
    }
  },
  methods: {
    handleEdit(index, row) {
      console.log(index, row)
    },
    handleDelete(index, row) {
      console.log(index, row)
    },
    _getCate(query = {}) {
      getCate(query).then(res => {
        if (res.errno === ERR_OK) {
          this.cate = res.data
        }
      })
    }
  }
}
</script>
