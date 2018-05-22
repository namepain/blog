<template>
  <list-view :options="options"></list-view>
</template>

<script>
import ListView from 'components/templates/ListView'
import { cate } from 'common/config/ListOption'

export default {
  created() {
    this.options = cate
  },
  components: {
    ListView
  }
}
</script>
