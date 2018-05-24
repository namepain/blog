<template>
<div class="main">
  <article class="post">
    <div class="meta">
      <div class="date">{{ blog.createdAt }}</div>
    </div>
    <h1 class="title">{{ blog.title }}</h1>
    <div class="entry-content" v-html="blog.content"></div>
  </article>
</div>
</template>

<script>

export default {
  asyncData: ({ store, route }) => {
    return store.dispatch('FETCH_BLOG', { query: { pathName: 'about' } })
  },
  computed: {
    blog() {
      return this.$store.state.blog
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
