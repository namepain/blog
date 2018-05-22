<template>
  <edit-view :options="cate"></edit-view>
</template>

<script>
import EditView from 'components/templates/EditView'
import { cate } from 'common/config/EditOption'

export default {
  created() {
    this.cate = cate
  },
  components: {
    EditView
  }
}
</script>
