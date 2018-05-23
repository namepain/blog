
import { getPost, getBlog, getArchives, getTags } from '../api'

export default {
  FETCH_ITEMS: ({ commit, state }, { query, callback }) => {
    // return api.fetch(model, query).then(items => {
    return getPost(query).then(items => {
      console.log('item是------>' + items)

      commit('SET_ITEMS', { items })
      callback && callback()
      return Promise.resolve()
    })
  },
  FETCH_BLOG: ({ commit, state, dispatch }, { query, callback }) => {
    return getBlog(query).then(res => {
      commit('SET_BLOG', { blog: res.blog })
      commit('SET_PREV', { prev: res.prev })
      commit('SET_NEXT', { next: res.next })

      callback && callback()

      return Promise.resolve()
    })
  },
  FETCH_ARCHIVES: ({ commit, state, dispatch }, { model, callback }) => {
    return getArchives().then(archives => {
      commit('SET_ARCHIVES', {archives})
      callback && callback()
      return Promise.resolve()
    })
  },
  FETCH_TAGS: ({ commit, state, dispatch }, { model, callback }) => {
    return getTags().then(tags => {
      commit('SET_TAGS', { tags })
      callback && callback()
      return Promise.resolve()
    })
  }
}
