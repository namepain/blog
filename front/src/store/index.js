import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      page: 1,
      items: [],
      archives: {},
      blog: {},
      prev: {},
      next: {},
      tags: [],
      siteInfo: {
        githubUrl: {
          value: ''
        },
        title: {
          value: ''
        },
        logoUrl: {
          value: ''
        },
        description: {
          value: ''
        },
        keywords: {
          value: ''
        },
        faviconUrl: {
          value: ''
        },
        miitbeian: {
          value: ''
        }
      }
    },
    actions,
    mutations,
    getters
  })
}
