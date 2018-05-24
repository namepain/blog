<template>
  <div class="main">
    <div class="top">
      <p>归于 <a href="javascript:;">{{ $route.params.tagName }}</a> 下的文章</p>
    </div>
    <blog-summary v-for="(item, index) in items" :key="index"
                  :article="item"
    ></blog-summary>
  </div>
</template>

<script>
import BlogSummary from './BlogSummary'

export default {
  computed: {
    items () {
      return this.$store.state.items
    }
  },
  asyncData: ({ store, route }) => {
    return store.dispatch('FETCH_TAG_ITEMS', { query: route.params })
  },
  components: {
    BlogSummary
  }
}
</script>

<style lang="stylus" scoped>
.top
  padding 20px 30px
  color #999
  background-color #f6f9fa
  text-align center
  font-weight 400
  font-size 22px
</style>
