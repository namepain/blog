<template>
  <div class="signin">
    <el-row type="flex" class="row-bg" justify="center" align="middle">
      <el-form ref="form" :model="form" :rules="rules" label-width="0">
        <p class="title">admin</p>
        <el-form-item label="" prop="name">
          <el-input v-model="form.name" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input type="password" v-model="form.password" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">登 录</el-button>
        </el-form-item>
      </el-form>
    </el-row>
  </div>
</template>

<script>
import { signIn, ERR_OK } from '../api/index.js'

export default {
  data() {
    return {
      form: {
        name: '',
        password: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.signIn()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    signIn() {
      if (!this.form.name || !this.form.password) {
        this.$message({
          message: '用户名或密码不能为空！！',
          type: 'warning'
        })
        return false
      }
      signIn(this.form).then(res => {
        res = res.data
        console.log(res)
        if (res.errno === ERR_OK) {
          this.$message({
            message: '登陆成功！',
            type: 'success',
            duration: 2000
          })
          this.$router.push({ path: '/admin' })
        } else {
          this.$message({
            message: '登陆失败，请检查帐号与密码',
            duration: 2000,
            type: 'error'
          })
        }
      }).catch(e => {
        this.$message({
          message: '网络请求失败！！',
          type: 'error'
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.signin {
  width: 100%;
  height: 100%;
  background-color: #f2f2f2;

  .row-bg {
    height: 100%;
    .el-form {
      width: 335px
      .title {
        margin-bottom: 10px
        text-align: center;
        font-size: 30px;
        height: 40px;
        line-height: 40px;
      }
    }
    .el-button--primary {
      width: 100%;
    }
  }
}
</style>
