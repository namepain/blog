# vue 中的 watcher

本文将从 ```watch``` 侦听属性的创建步步深入对源码进行探究，基于源码版本 [v2.6.10](https://github.com/vuejs/vue)

侦听属性一般有两种创建方式，配置 `watch` 对象 和 `$watch()` 方法

## watch 对象

初始化 vm 实例时的 `watch` 配置, 以对象形式告诉 vue 观察哪些属性。

示例：
```js
new Vue({
  data: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: {
      f: {
        g: 5
      }
    }
  },
  watch: {
    a: function (val, oldVal) {
      console.log('new: %s, old: %s', val, oldVal)
    },
    // 方法名
    b: 'someMethod',
    // 深度 watcher
    c: {
      handler: function (val, oldVal) { /* ... */ },
      deep: true
    },
    // 该回调将会在侦听开始之后被立即调用
    d: {
      handler: function (val, oldVal) { /* ... */ },
      immediate: true
    },
    e: [
      'handle1',
      function handle2 (val, oldVal) { /* ... */ },
      {
        handler: function handle3 (val, oldVal) { /* ... */ },
        /* ... */
      }
    ],
    // watch vm.e.f's value: {g: 5}
    'e.f': function (val, oldVal) { /* ... */ }
  }
})
vm.a = 2 // => new: 2, old: 1
```
这是 `watch` api 最常见使用方式，定义一个对象，此对象会在 vm 实例初始化时被遍历观察，具体发生在 ```_init``` 方法内部 ```initState(vm)``` 环节, 如下源码，调用 ```initWatch(vm, opts.watch)```

```js
// src\core\instance\state.js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)           // 处理 props, 在 data 之前，可被 data 函数内调用
  if (opts.methods) initMethods(vm, opts.methods)     // 处理 method, 在 data 之前，可被 data 函数内调用
  if (opts.data) {
    initData(vm)                                      // 处理 data
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)  // 处理 computed
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)                         // 处理 watch
  }
}

function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {                          // 遍历 watch 中的属性
    const handler = watch[key]
    if (Array.isArray(handler)) {                     // 参数处理 -- 如果是数组，逐个创建 watcher
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)                 // 非数组直接对 key 创建 handler
    }
  }
}

function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {       // 参数处理 -- 如果该属性传的是 options 对象，则取对象的 handler 方法作为回调
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {  // 参数处理 -- 如果 handler 传的是字符串，则取 method 上同名方法作为 handler
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)   // 最后调用 $watch api 初始化 watcher
}
```
可以看到 `watch` 的配置最终还是在内部调用了 `$watch` api 处理，与第二种方式殊途同归。

## $watch 方法

Vue 允许我们通过 `$watch` 在代码中命令式的观察属性。

示例：
```js
// 键路径
vm.$watch(
  'a.b.c',                      // 通过以 . 分割的字符串，观察属性里的属性
  function (newVal, oldVal) {
    // 做点什么
  },
  {
    immediate: true,            // 初始化观察后，立即调用一次回调
    deep: true                  // 深度观察属性，会递归观察全部子属性
  }
)

// 函数
vm.$watch(
  function () {
    // 表达式 `this.a + this.b` 每次得出一个不同的结果时
    // 处理函数都会被调用。
    // 这就像监听一个未被定义的计算属性
    return this.a + this.b
  },
  function (newVal, oldVal) {
    // 做点什么
  }
)
```
可以看到，直接调用 `$watch` 方法命令式观察属性时，配置依旧强大。第一种 `watch` 配置方式能做到的事，此方法也都能做到，更甚于还能观察一个 `function`, 效果类似定义了一个 `computed` 属性。

另外源码中 `$watch` 方法返回一个 `unwatchFn`, 可以让我们随时取消观察！
```js
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
  const vm: Component = this
  if (isPlainObject(cb)) {                             // 参数处理 -- 回调是对象则调用 createWatcher 处理参数
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  options.user = true                                 // 标记为 user watcher, 用于后续贴心的错误处理
  const watcher = new Watcher(vm, expOrFn, cb, options)   // new 一个 Watcher 实例
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value)                      // 配置了 immediate 则立即调用一次
    } catch (error) {
      handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)  // 贴心的错误处理
    }
  }
  return function unwatchFn () {                      // 返回一个取关 fn
    watcher.teardown()
  }
}
```

可以看到，做了一堆参数处理后，最终的实干者是 `Watcher` 类。
```js
// src\core\observer\watcher.js
export default class Watcher {
  constructor (vm: Component, expOrFn: string | Function, cb: Function, options?: ?Object, isRenderWatcher?: boolean) {
    this.vm = vm
    if (isRenderWatcher) {                       // 如果是渲染 watcher 则挂在 vm._watcher 上
      vm._watcher = this
    }
    vm._watchers.push(this)                      // 把当前 watcher 实例推入 vm.watchers 队列里保存
    // options
    if (options) {
      this.deep = !!options.deep                 // deep watcher 标志
      this.user = !!options.user                 // user watcher 标志
      this.lazy = !!options.lazy                 // lazy watcher 标志
      this.sync = !!options.sync                 // sync watcher 标志
      this.before = options.before               // 前置调用的方法，比如用于调用 beforeUpdate 钩子
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb                                // 回调
    this.id = ++uid                             // 为了批处理加 id 标识
    this.active = true
    this.dirty = this.lazy                      // for lazy watchers
    this.deps = []                              // 依赖收集器队列
    this.newDeps = []                           // 新的依赖收集器队列，用于替换更新依赖
    this.depIds = new Set()                     // 依赖收集器 id 集合
    this.newDepIds = new Set()                  // 新依赖收集器 id 集合
    this.expression = process.env.NODE_ENV !== 'production'     // 观察的键字符串
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {        // 定义 getter，如果传进来的观察对象不是键的字符串而是function，则直接把此 function 作为 getter，类似 computed 属性
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)          // 如果是键字符串，则解析属性路径。其实就是属性的收敛
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy                      // 如果是 lazy watcher 则当前并不求值，否则直接调用 get 方法开始求值
      ? undefined
      : this.get()
  }
}
```
调用构造器后 `watcher` 实例算是创建了，创建过程中会判断此 `watcher` 若为渲染 `watcher` 则挂在 `vm._wather` 属性上，顾名思义，渲染 water 自当是通知页面视图渲染的观察者了，此处便与视图层关联起来。


而后所有 `watcher` 都会被推入 `vm._watchers` 队列统一管理，并处理了四个标志，读到这里发现其实 `watcher` 根据这四个标志来分为四类 `watcher` 更为科学。后文再重新分类整理。

构造器的最后处理好 `getter` ，便根据是否 `lazy` 决定是否立即调用 `get` 方法对 `getter` 求值并完成收集依赖。

```js
get () {
  pushTarget(this)                      // 将自己挂在 Dep.target 上，以便后续的依赖的属性完成对观察者的收集
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)    // 调用 getter
  } catch (e) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)   // 贴心的错误处理
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)                   // deep watcher 则会递归观察
    }
    popTarget()                         // 结束依赖收集
    this.cleanupDeps()                  // 整理依赖关系！！ re-collect dependencies
  }
  return value                          // 最后将计算得到的值返回
}
```

此处先将自己（也就是 `watcher` 实例 / 观察者）挂在全局的 `Dep.target` 上，然后调用 `getter` 方法。而 `getter` 方法有两种情况：
- 可以是前文提到的 `$watch()` 方法第一个参数的 `function`，求值时被执行并完成收集依赖，因而我们说他是类 `computed` 属性。
- 键的字符串，此时键的字符串会被 `parsePath()` 方法解析返回一个 `function`, 这个 `function` 做的事就是收敛求值，如 `'a.b.c'` 则会取到 `vm.a.b.c` 的值，同样的，在取 `vm.a.b.c` 此属性的值时，会调用 `vm.a.b.c` 属性的 `getter`, 而他的 `getter` 早已被 `Object.defineProperty` 重写，因此完成了依赖的收集

值得注意的是：`this.cleanupDeps() ` 方法会在每次求值的时候执行，源码对 get 方法给出的注释是 `// Evaluate the getter, and re-collect dependencies.`

```js
cleanupDeps () {
  let i = this.deps.length
  while (i--) {
    const dep = this.deps[i]
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this)
    }
  }
  let tmp = this.depIds                 // tmp 变量指向 depIds 这个 Set 的内存地址 
  this.depIds = this.newDepIds          // depIds 属性指向 newDepIds 这个 Set 的内存地址
  this.newDepIds = tmp                  // newDepIds 属性指向 tmp 这个 Set 的内存地址
  this.newDepIds.clear()                // 清除 newDepIds 这个属性指向的 Set
                                        // 再利用 tmp 变量交换并清楚 deps 数组！！
  tmp = this.deps                       // tmp 变量指向 deps 这个数组的 内存地址
  this.deps = this.newDeps              // deps 属性指向 newDeps 这个数组的内存地址
  this.newDeps = tmp                    // newDeps 属性指向 tmp 这个数组的内存地址
  this.newDeps.length = 0               // 清除 newDeps 数组
}
```
在这个方法中，遍历了 `this.deps` 队列, 对比 `newDepsIds` 队列中如果没有 `dep.id` 项，则清除该 `dep` 项。

那么为什么 `newDepIds` 会出现没有 `dep.id` 这种情况呢？考虑这样一种情况：计算属性 `x` 的 `getter` 内有 `if-else` 分支，`if` 分支引用了属性 `a` 和属性 `b`, 而到了某种情况后，`x` 再次计算时走到了 `else` 分支，引用了属性 `a` 和属性 `c`。那么此时 `x` 并不依赖于属性 `b`, 倘若不清除依赖关系，属性 `b` 变化时岂不是会通知 `c` 的 watcher 执行？ 但此时 `c` 的计算结果并不依赖于 `b` 自然也就不会发生变化，造成了不必要的计算处理，浪费了效率。因此，每次求值时重新整理依赖关系有利于效率的提升。

循环后一段代码初看有点懵，但细看后不禁赞叹对内存的节省使用真的严谨。利用一个中间变量 `tmp`, 交换 `depIds` 和 `newDepIds` 两个 `Set` 的内存地址并清空 `newDepIds` 这个 `Set`, 交换 `deps`和`newDeps` 两个数组的内存地址并清空 `newDeps` 这个数组。这样一来不用 new 数组 和 Set, 省内存省效率。


至此，一个完整的 `watcher` 创建完成了，同时我们也留下了疑问，构造器中的四种 `watcher` 分别有什么特别的？接下来重新根据这四个类别进行梳理。

---
前文读到 `watcher` 构造器代码时说到 `watcher` 可以根据其四种标志分为四类

## deep watcher
当我们配置了 deep 属性时，对该侦听属性第一次 "touch" 求值也就是调用 `watcher` 的 `get` 方法时会递归的侦听他身上的所有属性
```js
 get () {
  pushTarget(this)

  // ···
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value)                             // 递归侦听所有属性
  }

  popTarget()

  // ···

  return value
}
```

同时被侦听的属性发生变化时，会在 `flushSchedulerQueue` 时会调用 `watcher.run` 方法，
```js
run () {
  if (this.active) {
    const value = this.get()
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep                       // 深度侦听后当前值没变，则说明其子属性有变化
                                      // 导致调用了 watcher.run() 所以还是得调用 cb 回调
    ) {
      // ···

      this.cb.call(this.vm, value, oldValue)
      
      // ···
    }
  }
}
```

## user watcher
用户创建的 `watcher`, 本质都是通过 $watch() 方法创建, 创建时赋予 `user` 标志 
```js
Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    // ··· 
    options.user = true                 // 标记为 user watcher
    // ···
  }
```
通过 `ctrl + shift + F` 搜索发现这个标志其实只做了一件事，那就是在 `watcher` 的 `get` 方法中对侦听的属性求值 和 在 `run` 方法内侦听属性发生变化执行回调时做错误处理。

## lazy watcher
定义 computed 属性时会给 `new Watcher()` 传一个 `laze: true`

```js
const computedWatcherOptions = { lazy: true }

function initComputed (vm: Component, computed: Object) {
  const watchers = vm._computedWatchers = Object.create(null)

  for (const key in computed) {
    // ···

    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions            // 通过 lazy: true 标识了 计算属性的 watcher
    )

    // ···
  }
}
```
于是乎，前文中在 new Watcher() 的构造器最后一行便不会立即计算求值。只有在我们访问 计算属性时，会调用计算属性的 `computedGetter()`, 也就会访问该属性的 `computedWatcher` 的 `value` 值。

而求值又有一些条件，倘若 `watcher.dirty` 为 `true` ( 计算属性的 `watcher` 构造器中 `this.dirty = this.lazy = true ` ), 则执行 `watcher.evaluate()` 进行一次求值, 并将 `dirty` 标志变为 `false`, 自此再次访问该计算属性时便不会重新计算，也就达到了缓存的效果。

之后，根据 `Dep.target` 进行了依赖的收集, 倘若依赖发生变化自然是会调用 `watcher.update` 方法, 此方法内发现倘若时 `lazy watcher`, 则并不执行，而是改变 `dirty` 标志为 `true`, 那么在下次我们需要访问该计算属性的时候，自然会因为 `dirty: true` 而重新执行 `evaluate` 求值了。 所以 `computed` 属性真的很懒，不用它则不计算求值，依赖不改变也不会重新计算求值，从而说明 `computed` 属性很高效！！

```js
// src\core\instance\state.js: 242
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

// src\core\observer\watcher.js
/**
  * Evaluate the value of the watcher.
  * This only gets called for lazy watchers.
  */
evaluate () {
  this.value = this.get()
  this.dirty = false
}

/**
  * Subscriber interface.
  * Will be called when a dependency changes.
  */
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

## sync watcher
最后一种 `watcher`, 查找了源码似乎并没有用过 `sync watcher`。那么这种 `watcher` 只能是给用户手动配置使用的 `watcher` 了。由 `watcher.update()` 方法源码得知, `sync watcher` 与普通 `watcher` 的区别就是不会 `queueWtahcer` 进行排队从而在 `nextTick` 执行，而是同步的直接执行。所以配置 `sync: true` 说明用户很急？

---

# 再梳理
上文中的分类是根据 Watcher 类构造器中的标志分类，并不完全符合我们对 Vue 的使用体验。
通过 `ctrl + shift + F` 在源码种查找 `new Watcher` 发现，总共有三处。分别是:
- `$mount` 方法内部调用 `mountComponent` 函数内部创建 `renderWatcher`
```js
// src\core\instance\lifecycle.js: 197
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

- `initComputed` 时创建 `lazy watcher`, 也就是**计算属性**
- `$watch` 时创建的 `user watcher`, 也就是**侦听属性**

显然，`renderWatcher` 建立了响应式数据 ( 包括 `data`, `computed` ) 与 视图的联系。`new Watcher` 时把 `updateComponent` 传进去作为 `watcher` 实例的 `getter`, 由于不是 `lazy watcher` 而会立即执行收集依赖，从而完成视图对数据的依赖关系收集，这也就是 `Vue` 官方文档所说的第一次 `'touch getter'` 吧。

而 `lazy watcher`, `user watcher` 分别完成了**计算属性**，**侦听属性**的任务。至此与响应式能力相关的重要部分算是都被 `Watcher` 类完成了。


### 总结
本文从 `watch` api 出发, 沿着侦听属性的创建路线步步深入源码，探究到 `Watcher` 类所起到的重要作用，然后关联到**计算属性**, `data` 响应式数据, 算是摸清了 `Vue` 响应式功能部分的主线。

作为一个功能强大的框架, `Vue` 的源码各条功能线相互有一些穿插，如上文提到的 `handleError`, `queueWatcher`, `mountComponent`, 并不能一次分析完。还得花很多时间积累啊。

