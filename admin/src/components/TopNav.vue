<template>
  <div class="top">
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="6"><div class="logo">Admin</div></el-col>
      <el-col :span="18">
        <el-menu class="el-menu-demo"
                :default-active="String(1)"
                mode="horizontal"
                @select="handleSelect"
                background-color="#23262E"
                text-color="#fff"
                active-text-color="#ffd04b">
          <el-submenu index="1">
            <template slot="title">管理员</template>
            <el-menu-item index="1-1">修改密码</el-menu-item>
            <el-menu-item index="1-2">注 销</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { signOut } from '../api/index.js'

export default {
  methods: {
    handleSelect(index, indexPath) {
      if (index === '1-1') {
        this.$router.push({ path: '/admin/userEdit' })
      } else if (index === '1-2') {
        this.logout()
      }
    },
    logout() {
      signOut()
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="stylus" scoped>
  .top
    height 60px
    overflow hidden
    background #24292e
    .logo
      line-height 60px
      height 60px
      text-align center
      font-size 40px
      color #fff
    .el-menu-demo
      display flex
      justify-content flex-end
</style>
