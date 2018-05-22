<template>
  <div class="main">
    <article>
      <h1 class="title">标签</h1>
      <div class="entry-content">
        <router-link class="tag-item"
            v-for="(val, key, index) in tags" :key="index"
            :to="{ name: 'tag', params: { tagName: key } }"
          >
            {{ key }} ({{ val }})
        </router-link>
      </div>
    </article>
  </div>
</template>

<script>

export default {
  asyncData: ({ store, route }) => {
    return store.dispatch('FETCH_TAGS', { model: 'tags' })
  },
  computed: {
    tags() {
      return this.$store.state.tags
    }
  }
}
</script>

<style lang="stylus" scoped>
  .tag-item
    box-sizing border-box
    display inline-block
    margin 0 10px 10px
    padding 0 15px
    height 40px
    line-height 40px
    font-size 14px
    border-radius 4px
    border 1px solid rgba(36,121,204,.8)
</style>
