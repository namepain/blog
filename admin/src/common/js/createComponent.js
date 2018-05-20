import ListView from 'components/templates/ListView.vue'
import EditView from 'components/templates/EditView.vue'
import ListOps from './ListOption'
import EditOps from './EditOption'

export function createList(model) {
  return {
    name: `${model}-list-view`,
    render(h) {
      return h(ListView, { props: { options: ListOps[model] } })
    }
  }
}

export function createEdit(model) {
  return {
    name: `${model}-create-view`,
    render(h) {
      return h(EditView, { props: { options: EditOps[model] } })
    }
  }
}
