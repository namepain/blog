<template>
  <div id="app" ref="app" :class="{'isShow': isShow}" @click="hideSide">
    <header class="header">
      <div class="btn" @click.stop="showSide"><i></i></div>
      <h1 class="title">点蚊子熏烟的博客</h1>
      <div class="avatar">
        <router-link to="/about">
          <img src="../public/logo.jpg" alt="头" width="30" height="30">
        </router-link>
      </div>
    </header>
    <nav-view class="left-nav"></nav-view>
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
  data() {
    return {
      isShow: false
    }
  },
  methods: {
    showSide() {
      this.isShow = true
    },
    hideSide() {
      this.isShow && (this.isShow = false)
    }
  },
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
    .header
      display none
      position fixed
      top 0
      width 100%
      height 50px
      line-height 50px
      text-align center
      background-color #323436
      z-index 9
      .btn
        position: absolute;
        top: 0;
        left: 0;
        height: 50px;
        width: 50px;
        cursor pointer
        &::before, &::after, i
          background-color: #fff;
          width: 22px;
          height: 1px;
          left: 14px;
          position: absolute;
          transition: all .2s cubic-bezier(.4,.01,.165,.99) .3s;
        &::before
          content ''
          top 17px
        & i
          content ''
          top 25px
        &::after
          content ''
          bottom 16px
      .title
        font-size 16px
        color #999
      .avatar
        position absolute
        width 30px
        height 30px
        top 50%
        right 10px
        transform translateY(-50%)
        border-radius 50%
        overflow hidden
    .footer
      position absolute
      left 0
      right 0
      bottom 0
      margin-top -80px
  .isShow .left-nav
    left 0!important
</style>
