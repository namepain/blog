<template>
  <div class="main">
    <article>
      <h1 class="title">归档</h1>
      <div class="entry-content" v-for="(item, key, index) in archives" :key="index">
        <h3>{{ key }} ({{ item.length }})</h3>
        <ul>
          <li v-for="(li, index) in item" :key="index">
            <router-link :to="{ name: 'post', params: { pathName: li.pathName } }"
                          :title="li.title"
            >
              {{ li.title }}
            </router-link>
            &nbsp;
            <span class="date">{{ li.createdAt ? li.createdAt.slice(0, 10) : '' }}</span>
          </li>
        </ul>
      </div>
    </article>
  </div>
</template>

<script>

export default {
  asyncData({ store, route }) {
    return store.dispatch('FETCH_ARCHIVES', { model: 'archives' })
  },
  computed: {
    archives() {
      return this.$store.state.archives
    }
  }
}
</script>
