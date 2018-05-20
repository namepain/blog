<template>
  <el-form ref="form" :model="form" label-width="120px">
    <el-form-item v-for="(item, index) in options.items" :key="index" :label="item.label">
      <el-input v-if="typeof item.description === 'undefined'"
                :autosize="{ minRows: 2, maxRows: 16}"
                :type="item.type || 'text'"
                v-model="form[item.prop]"></el-input>
      <el-popover
        v-if="typeof item.description !== 'undefined'"
        placement="right-start"
        :title="item.label"
        width="50%"
        trigger="hover"
        :content="item.description">
        <el-input slot="reference" :autosize="{ minRows: 2, maxRows: 16}" :type="item.type || 'text'" v-model="form[item.prop]"></el-input>
      </el-popover>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click.native="onSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: ['options'],
  data() {
    let form = this.options.items.reduce((prev, curr) => {
      prev[curr.prop] = curr.default || ''
      return prev
    }, {})
    return {
      form
    }
  },
  created() {
    let id = this.$route.params.id
    if (id !== undefined) {
      this._getModel(id)
    }
  },
  computed: {
    ...mapGetters([
      'model'
    ])
  },
  methods: {
    onSubmit() {
      let id = this.$route.params.id
      let formModel = this.$refs.form.model
      console.dir(formModel)
      if (!id) {
        this.postModel({
          model: this.options.model,
          param: formModel
        }).then(res => {
          if (res instanceof Error) {
            this.$message.error('提交失败！！')
          } else {
            this.$message({
              type: 'success',
              message: '新增成功！！'
            })
            console.log(this.model)
            this.$router.push({ path: `/${this.options.model}/create/${this.model.id}` })
          }
        })
      } else {
        this.patchModel({
          model: this.options.model,
          param: formModel
        }).then(res => {
          if (res instanceof Error) {
            this.$message.error('修改失败！！')
          } else {
            this.$message({
              type: 'success',
              message: '修改成功！！'
            })
          }
        })
      }
    },
    _getModel(id) {
      console.log(id)
      this.getModel({ model: this.options.model, query: { id: id } })
        .then(res => {
          if (res instanceof Error) {
            this.$message.error('网络请求错误！！')
            return false
          }
        })
    },
    ...mapActions({
      'getModel': 'GET_MODEL',
      'postModel': 'POST_MODEL',
      'patchModel': 'PATCH_MODEL'
    })
  },
  watch: {
    model() {
      Object.assign(this.form, this.model)
    }
  }
}
</script>

<style lang="stylus" scoped>
  .el-form {
    width: 40%;
    margin-top: 20px;
    margin-right: 20px;
    .el-button {
      width: 100%;
    }
  }
</style>
