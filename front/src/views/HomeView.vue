<template>
  <div class="main">
    <blog-summary v-for="(item, index) in items" :key="index"
                  :article="item"
    ></blog-summary>
    <h1 v-if="!items || !items.length" class="noArticle">还没开张哦~</h1>
    <div class="pager" v-if="total > 10">
      <router-link v-if="page > 1" :to="`/?page=${+page - 1}`" class="prev">
        &lt;&lt; 上一页
      </router-link>
      <router-link to="/archives"  class="center">
        博客归档
      </router-link>
      <router-link v-show="total > 10 * page" :to="`/?page=${+page + 1}`" class="next">
        下一页 &gt;&gt;
      </router-link>
    </div>
  </div>
</template>

<script>
import BlogSummary from './BlogSummary'

export default {
  computed: {
    page () {
      return this.$store.state.page
    },
    items () {
      return this.$store.state.items
    },
    total () {
      return this.$store.state.total
    }
  },
  asyncData: ({ store, route }) => {
    return store.dispatch('FETCH_ITEMS', { model: 'items', query: route.query })
  },
  components: {
    BlogSummary
  }
}
</script>

<style lang="stylus" scoped>
.noArticle
  padding 20px
  text-align center
.pager
  position relative
  height 60px
  line-height 60px
  text-align center
  border-bottom 1px solid #ddd
  .prev
    float left
  .next
    float right
  .center
    position absolute
    left 50%
    transform translateX(-50%)
</style>
