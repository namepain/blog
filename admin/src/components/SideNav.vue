<template>
  <div class="sideNav">
    <el-menu default-active="2"
            class="el-menu-vertical-demo"
            @select="selectMenu"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-document"></i>
          <span>文章管理</span>
        </template>
        <el-menu-item index="1-1">
          <i class="el-icon-tickets"></i>
          <span>文章列表</span>
        </el-menu-item>
        <el-menu-item index="1-2">
          <i class="el-icon-edit"></i>
          <span>添加文章</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="2">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span slot="title">分类管理</span>
        </template>
        <el-menu-item index="2-1">
          <i class="el-icon-tickets"></i>
          <span>分类列表</span>
        </el-menu-item>
        <el-menu-item index="2-2">
          <i class="el-icon-edit"></i>
          <span>添加分类</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="3">
        <template slot="title">
          <i class="el-icon-star-off"></i>
          <span slot="title">标签管理</span>
        </template>
        <el-menu-item index="3-1">
          <i class="el-icon-tickets"></i>
          <span>标签列表</span>
        </el-menu-item>
        <el-menu-item index="3-2">
          <i class="el-icon-edit"></i>
          <span>添加标签</span>
        </el-menu-item>
      </el-submenu>

      <el-menu-item index="4">
        <i class="el-icon-setting"></i>
        <span slot="title">系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>

function getRoute(index) {
  let route = ''
  switch (index) {
    case '1-1':
      route = '/post/list'
      break
    case '1-2':
      route = '/post/create'
      break
    case '2-1':
      route = '/cate/list'
      break
    case '2-2':
      route = '/cate/create'
      break
    case '3-1':
      route = '/tag/list'
      break
    case '3-2':
      route = '/tag/create'
      break
    case '4':
      route = '/system'
      break

    default:
      break
  }
  return route
}

export default {
  methods: {
    selectMenu(index) {
      const path = getRoute(index)
      this.$router.push({ path: path })
    }
  }
}
</script>

<style lang="stylus" scoped>
  .sideNav
    flex 0 0 12em
    background rgb(84, 92, 100)
    overflow-x hidden
    .el-menu-vertical-demo
      border 0
</style>
