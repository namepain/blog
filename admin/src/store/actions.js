import { createGet, createDelete, createPost, createPatch, ERR_OK } from 'api'

export default {
  'GET_LIST'({ commit, state }, { model, query }) {
    if (!model) {
      return false
    }
    return createGet(model, {}).then(res => {
      console.log(res)
      res = res.data
      if (res.errno === ERR_OK) {
        commit('SET_LIST', res.data)
      } else {
        return Promise.resolve(new Error('执行失败，请检查参数是否正确！！'))
      }
    }).catch(e => {
      return Promise.resolve(e)
    })
  },

  'DELETE_LIST_ITEM'({ commit, state }, { model, query }) {
    if (!model) {
      return false
    }
    return createDelete(model, query).then(res => {
      console.log('-------query.id----->' + res)
      res = res.data
      if (res.errno === ERR_OK) {
        const id = query.id
        const list = state.list.filter((item) => {
          return item.id !== id
        })
        commit('SET_LIST', list)
      } else {
        return Promise.resolve(new Error('执行失败，请检查参数是否正确！！'))
      }
    }).catch(e => {
      return Promise.resolve(e)
    })
  },

  'GET_MODEL'({ commit, state }, { model, query }) {
    if (!model) {
      return false
    }
    return createGet(model, { id: query.id }).then(res => {
      console.log('---------------model---------->' + res)
      res = res.data
      if (res.errno === ERR_OK) {
        commit('SET_MODEL', res.data[0])
      } else {
        return Promise.resolve(new Error('执行失败，请检查参数是否正确！！'))
      }
    }).catch(e => Promise.resolve(e))
  },

  'POST_MODEL'({ commit, state }, { model, param = {} }) {
    if (!model) {
      return false
    }
    return createPost(model, param).then(res => {
      console.log('------------add model------>' + res)
      res = res.data
      if (res.errno === ERR_OK) {
        commit('SET_MODEL', res.data)
      } else {
        return Promise.resolve(new Error('执行失败，请检查参数是否正确！！'))
      }
    }).catch(e => Promise.resolve(e))
  },

  'PATCH_MODEL'({ commit, state }, { model, param = {} }) {
    if (!model) {
      return false
    }
    return createPatch(model, param).then(res => {
      res = res.data
      if (res.errno === ERR_OK) {
        commit('SET_MODEL', res.data)
      } else {
        return Promise.resolve(new Error('执行失败，请检查参数是否正确！！'))
      }
    }).catch(e => Promise.resolve(e))
  }
}
