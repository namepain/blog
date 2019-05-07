# 实现 Vuex 的核心功能

`Vuex` 为我们提供集中式的状态管理

![Vuex](./vuex.png)

我们需要
- Vue 实例及每个组件中都可以使用 $store 访问到数据仓库
- 一个集中式的仓库, 可存储数据, 通知页面变更
- getters 获取仓库的数据
- commit 方法修改仓库的数据
- dispatch 派发动作

## install
使用 `vuex` 时需要 `Vue.use(Vuex)` 安装插件。`Vue.use` 会调用插件提供的 `install` 方法并传入 `Vue` 对象

```js
function install(Vue) {
  Vue.mixin({                                                 // mixin 到每个组件的 beforeCreate 钩子
    beforeCreate: function() {
      const options = this.$options

      if (options.store) {                                    // 说明是根组件，则将仓库挂在 $store 上
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store
      } else if (options.parent && options.parent.$store) {   // 子组件则检查父组件上是否有 $store
        this.$store = options.parent.$store                   // 有则保存 $store, 使得全局指向唯一仓库
      }
    }
  })
}
```

## store

`Vue` 具有现成的数据存储能力，数据响应式能力，可用做存储数据的 `store`
```js
class Vuex {
  constructor(options) {
    const {
      state,
      getters
    } = options

    this.initState(state, getters)
  }

  get state() {
    return this._vm._data.$$store                 // 获取 state
  }

  initState(state, getters) {
    this._vm = new Vue({
      data: {
        $$store: state                            // 使用 vue data 提供响应式能力
      }
    })
  }
}
```

## getters
定义的 `getters` 一般长这样: `state => state.count`
既然是函数，自然可以通过计算属性来获取了

```js
initState(state, getters) {
  let computed = {}
  let store = this
  store.getters = {}                                                // getters 容器
  Object.keys(getters).forEach(key => {
    computed[key] = () => getters[key].call(null, this.state)       // computed 属性是 function
    Object.defineProperty(store.getters, key, {                      // 把定义的 getter 函数包装
      get() {                                                       // 成 computed 
        return store._vm[key]                                        // 同时代理到 this._vm 对象上
      }                                                             // 便于访问
    })
  })

  this._vm = new Vue({
    data: {
      $$store: state                            // 使用 vue data 提供响应式能力
    },
    computed                                    // 使用 computed 提供 getters
  })
}
```

## commit

`commit` 就很简单了，把 `state`, `payload` 参数传入就好了
```js
commit(mutationType, payload) {
  this._mutations[mutationType].call(null, this.state, payload)
}
```

## dispatch
`dispatch` 方法类似 `commit`, 只不过其第一个入参为 `context` 代理对象，上面有 state, commit, dispatch 等功能。

```js
dispatch(actionType, payload) {
  const context = {
    state: this.state,
    dispatch: this.dispatch.bind(this),
    commit: this.commit.bind(this)
  }
  this._actions[actionType].call(null, context, payload)
}
```

核心机制大概就这样，Vuex 自然具有更多的功能，例如
- `modules` —— 递归的注册数据子模块，模块功能还考虑了 `namespace`，有点复杂，懒得去实现了。。
- `subscribe` 机制, 发布订阅模式的实现，可以订阅 `commit` 后事件，`dispatch` 前/后事件，多适用于插件
- `map` 辅助函数, 映射 `state, getters, mutations, acitons`, 使得代码更优雅