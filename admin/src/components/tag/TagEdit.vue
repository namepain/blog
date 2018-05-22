<template>
  <edit-view :options="tag"></edit-view>
</template>

<script>
import EditView from 'components/templates/EditView'
import { tag } from 'common/config/EditOption'

export default {
  created() {
    this.tag = tag
  },
  components: {
    EditView
  }
}
</script>
