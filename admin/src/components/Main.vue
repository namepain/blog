<template>
  <div class="main">
    <top-nav></top-nav>
    <div class="middle-body">
      <side-nav></side-nav>
      <router-view class="body-content"></router-view>
    </div>
  </div>
</template>

<script>
import TopNav from './TopNav'
import SideNav from './SideNav'

export default {
  components: {
    TopNav,
    SideNav
  }
}
</script>

<style lang="stylus" scoped>
  .main
    height 100%
    display flex
    flex-direction: column
    .middle-body
      display flex
      flex 1
      .body-content
        flex 1
        overflow-y auto
</style>
