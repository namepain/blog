<template>
<div class="main">
  <article class="post">
    <div class="meta">
      <div class="date">{{ blog.createdAt }}</div>
    </div>
    <h1 class="title">{{ blog.title }}</h1>
    <div class="entry-content" v-html="blog.content"></div>
  </article>
  <nav class=pagination v-if="blog.pathName !== 'about'">
    <router-link v-if="prev && prev.pathName"
      :to="{name:'post', params: {pathName: prev.pathName }}" class="prev">&laquo; {{prev.title }}</router-link>
    <router-link v-if="next && next.pathName && next.pathName !== 'about'"
      :to="{name:'post', params: {pathName: next.pathName }}" class="next">{{next.title }} &raquo;</router-link>
  </nav>
</div>
</template>

<script>

export default {
  asyncData: ({ store, route }) => {
    return store.dispatch('FETCH_BLOG', { query: { pathName: route.params.pathName } })
  },
  computed: {
    blog() {
      return this.$store.state.blog
    },
    prev() {
      return this.$store.state.prev
    },
    next() {
      return this.$store.state.next
    }
  }
}
</script>

<style lang="stylus" scoped>
.main
  position: relative
  .pagination
    position: absolute;
    left: 40px;
    right: 40px;
    bottom: 5px;
.next
  float right
</style>
