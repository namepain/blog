<template>
  <div id="app">
    <nav-view></nav-view>
    <section class="aricle-container">
      <router-view></router-view>
    </section>
    <blog-footer class="footer"></blog-footer>
  </div>
</template>

<script>
import NavView from 'views/NavView'
import BlogFooter from 'views/BlogFooter'

export default {
  components: {
    NavView,
    BlogFooter
  }
}
</script>

<style lang="stylus" scoped>
  #app
    box-sizing border-box
    position relative
    min-height 100%
    padding-bottom 80px
    margin-left 250px
    .footer
      position absolute
      left 0
      right 0
      bottom 0
      margin-top -80px
</style>
