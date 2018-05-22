<template>
  <article class="post">
    <div class="meta">
      <div class="date">{{ article.createdAt }}</div>
    </div>
    <h1 class="title">
      <router-link :to="{ name:'post', params:{ pathName: article.pathName } }" >{{ article.title }}
      </router-link>
    </h1>
    <div class="entry-content">
      <div v-html="article.summary"/>
      <router-link :to="{ name:'post', params:{ pathName: article.pathName } }" >阅读全文 »</router-link>
    </div>
  </article>
</template>

<script>
export default {
  props: {
    article: {
      type: Object,
      required: true
    }
  }
}
</script>
