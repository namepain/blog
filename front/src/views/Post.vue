<template>
<div class="main">
  <article class="post">
    <div class="meta">
      <div class="date">{{ blog.createdAt }}</div>
    </div>
    <h1 class="title">{{ blog.title }}</h1>
    <div class="entry-content" v-html="blog.content"></div>
  </article>
  <nav class=pagination>
    <router-link v-if="prev.pathName"
      :to="{name:'post', params: {pathName: prev.pathName }}" class="prev">&laquo; {{prev.title }}</router-link>
    <router-link v-if="next.pathName"
      :to="{name:'post', params: {pathName: next.pathName }}" class="next">{{next.title }} &raquo;</router-link>
  </nav>
</div>
</template>

<script>

export default {
  asyncData: ({ store, route }) => {
    return store.dispatch('FETCH_BLOG', { model: 'blog', query: route.query })
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
