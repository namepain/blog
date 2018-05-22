<template>
  <nav class="nav-wrapper">
    <div class="profile">
      <div class="avatar">
        <img src="../../public/logo-48.png" width="140" height="140">
      </div>
      <h2 class="name">点蚊子熏烟</h2>
    </div>
    <ul class="link-list">
      <li class="link-item">
        <router-link to="/">
          <i class="iconfont icon-home"></i>
          <span>首页</span>
        </router-link>
      </li>
      <li class="link-item">
        <router-link to="/archives">
          <i class="iconfont icon-archive"></i>
          <span>归档</span>
        </router-link>
      </li>
      <li class="link-item">
        <router-link to="/tags">
          <i class="iconfont icon-tags"></i>
          <span>标签</span>
        </router-link>
      </li>
      <li class="link-item">
        <router-link to="/about">
          <i class="iconfont icon-user"></i>
          <span>关于</span>
        </router-link>
      </li>
      <!-- <li class="link-item">
        <router-link to="/search">
          <i class="iconfont icon-search"></i>
          <span>搜索</span>
        </router-link>
      </li> -->
    </ul>
    <div class="buttons">
      <a href="https://github.com/namepain" target="_blank" class="button github">
        <i class="iconfont icon-github-v"></i>
      </a>
      <a href="mailto:18086514402@163.com" class="button email">
        <i class="iconfont icon-mail"></i>
      </a>
    </div>
  </nav>
</template>

<script>
export default {
}
</script>

<style lang="stylus" scoped>
.nav-wrapper
  position fixed
  left 0
  top 0
  height 100%
  width 250px
  background #202020!important
  color #999
  a
    color #999
  .profile
    padding 40px 0 10px 0
    text-align center
    .avatar
      img
        border-radius 50%
        overflow hidden
    .name
      margin-top 10px
      padding 10px 0
      font-size 18px
  .link-list
    margin-top 20px
    .link-item
      padding-left 50px
      height 45px
      line-height 45px
      font-size 0px
      &:hover
        >a
          color #bbb
      >a
        display inline-block
        width 100%
        transition color .3s
      .iconfont
        display inline-block
        margin-right 20px
        width 25px
        height 45px
        line-height 45px
        font-size 20px
        text-align center
        vertical-align middle
      span
        font-size 16px
        display inline-block
        vertical-align middle
  .buttons
    padding 20px 0 0 50px
    .button
      margin-right 40px
      display inline-block
      line-height 45px
      height 45px
      .iconfont
        font-size 20px
</style>
