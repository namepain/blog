
import { getPost, getBlog, getArchives, getTags, getBytag } from '../api'

export default {
  FETCH_ITEMS: ({ commit, state }, { query, callback }) => {
    return getPost(query).then(data => {
      commit('SET_ITEMS', { items: data.items })
      commit('SET_TOTAL', { total: parseInt(data.total) })
      commit('SET_PAGE', { page: parseInt(data.page) })
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
  FETCH_ARCHIVES: ({ commit, state, dispatch }, { callback }) => {
    return getArchives().then(archives => {
      commit('SET_ARCHIVES', {archives})
      callback && callback()
      return Promise.resolve()
    })
  },
  FETCH_TAGS: ({ commit, state, dispatch }, { callback }) => {
    return getTags().then(tags => {
      commit('SET_TAGS', { tags })
      callback && callback()
      return Promise.resolve()
    })
  },
  FETCH_TAG_ITEMS: ({ commit, state }, { query, callback }) => {
    return getBytag(query).then(items => {
      commit('SET_ITEMS', { items })
      callback && callback()
      return Promise.resolve()
    })
  }
}
