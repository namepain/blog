<template>
  <list-view :options="options"></list-view>
</template>

<script>
import ListView from 'components/templates/ListView'
import { post } from 'common/config/ListOption'

export default {
  created() {
    this.options = post
  },
  components: {
    ListView
  }
}
</script>
