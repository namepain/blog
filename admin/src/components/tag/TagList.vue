<template>
  <list-view :options="options"></list-view>
</template>

<script>
import ListView from 'components/templates/ListView'
import { tag } from 'common/config/ListOption'

export default {
  created() {
    this.options = tag
  },
  components: {
    ListView
  }
}
</script>
