<template>
  <div class="main">
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
    console.log(route.query)
    return store.dispatch('FETCH_ITEMS', { model: 'items', query: route.query })
  },
  components: {
    BlogSummary
  }
}
</script>
