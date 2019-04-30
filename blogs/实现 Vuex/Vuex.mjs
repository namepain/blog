class Vuex {
  constructor(options) {
    const {
      state,
      getters,
      mutations,
      actions
    } = options

    // this.getters
    this.initState(state, getters)

    this._mutations = mutations
    this._actions = actions
  }

  get state() {
    return this._vm._data.$$store
  }

  set state(v) {
    throw new Error('这里不可以~')
  }

  initState(state, getters) {
    // state => state.count
    // fn.apply(this, this.$$store)
    let computed = {}
    let store = this
    store.getters = {}
    Object.keys(getters).forEach(key => {
      computed[key] = () => getters[key].call(null, this.state)
      Object.defineProperty(store.getters, key, {
        get() {
          debugger
          return store._vm[key]
        }
      })
    })

    this._vm = new Vue({
      data: {
        $$store: state                            // 使用 vue data 提供响应式能力
      },
      computed                                    // 使用 computed 提供 getters
    })
  }

  commit(mutationType, payload) {
    debugger
    this._mutations[mutationType].call(null, this.state, payload)
  }

  dispatch(actionType, payload) {
    const context = {
      state: this.state,
      dispatch: this.dispatch.bind(this),
      commit: this.commit.bind(this)
    }
    this._actions[actionType].call(null, context, payload)
  }

}

export function install(Vue) {
  // debugger
  Vue.mixin({
    beforeCreate: function() {
      const options = this.$options

      // 根节点, 初始化 $store, 使得在实例中可以拿得到
      // debugger
      if (options.store) {
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store
      // 子节点, 则获取父节点的 $store, 使得仓库全局唯一
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
    }
  })
}

export default { Store: Vuex, install }