
import { api, getPost } from '../api'

export default {
  FETCH_ITEMS: ({ commit, state }, { query, callback }) => {
    // return api.fetch(model, query).then(items => {
    return getPost(query).then(items => {
      console.log('item是------>' + items)

      commit('SET_ITEMS', { items })
      callback && callback()
      // if (state.totalPage === -1) {
      //   return api.fetch(model, {
      //     conditions: {
      //       type: 'post',
      //       isPublic: true
      //     },
      //     count: 1
      //   }).then(totalPage => {
      //     commit('SET_PAGES', {
      //       totalPage: Math.ceil(totalPage / 10)
      //     })
      //   })
      // }
      return Promise.resolve()
    })
  },
  FETCH_BLOG: ({ commit, state, dispatch }, { model, query, callback }) => {
    return api.fetch(model, query).then(blog => {
      commit('SET_BLOG', { blog })

      callback && callback()

      return Promise.resolve()
    })
  },
  FETCH_ARCHIVES: ({ commit, state, dispatch }, { model, callback }) => {
    return api.fetch(model).then(archives => {
      commit('SET_ARCHIVES', {archives})
      callback && callback()
      return Promise.resolve()
    })
  },
  FETCH_TAGS: ({ commit, state, dispatch }, { model, callback }) => {
    return api.fetch(model).then(tags => {
      commit('SET_TAGS', { tags })
      callback && callback()
      return Promise.resolve()
    })
  }
}
