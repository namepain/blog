class Vue {
  constructor({ el, data, computed = {}, watch = {}, methods = {} }) {
    this._data = data
    this.$el = el
    this.methods = methods
    this.computeds = computed
    this.watchs = watch

    this.initMethods()      // 初始化 methods
    this.initData()         // 初始化 data
    this.initComputed()     // 初始化 computed
    this.initWatch()        // 初始化 watch

    new Compiler(this.$el, this)           // 挂载 dom
  }

  initMethods() {
    let methods = this.methods
    for (let key in methods) {
      Object.defineProperty(this, key, {
        get: function() {
          return methods[key]
        }
      })
    }
  }

  initData() {
    new Observer(this._data)

    // 代理 data, 使我们可直接访问 vm._data 上到数据。 这个步骤须在 watch 之前，以便侦听属性收集依赖
    this.proxy(this._data)
  }

  initComputed() {
    let computeds = this.computeds
    for (let key in computeds) {
      let computedWatcher = new Watcher(this, computeds[key], undefined, true)
      Object.defineProperty(this, key, {
        get: function() {
          if (computedWatcher.dirty) {
            computedWatcher.get()
            computedWatcher.dirty = false
          }
          return computedWatcher.value
        }
      })
    }
  }

  initWatch() {
    let watchers = this.watchs
    for(let key in watchers) {
      let cb = watchers[key]
      debugger
      new Watcher(this, key, typeof cb === 'function' ? cb : cb.handler)
    }
  }

  proxy(data) {
    for (let key in data) {
      Object.defineProperty(this, key, {
        get: function() {
          return data[key]
        },
        set: function(v) {
          data[key] = v
        }
      })
    }
  }
}


// 响应化对象
class Observer {
  constructor(data) {
    this.walk(data)
  }

  walk(data) {
    for (let key in data) {
      // 深度优先遍历子属性
      if (data[key] && typeof data[key] === 'object') {
        this.walk(data[key])
      }

      // 拦截 getter setter
      this.defineReactive(data, key, data[key])
    }
  }

  defineReactive(data, key, value) {
    let dep = new Dep()
    Object.defineProperty(data, key, {
      get: function() {
        Dep.target && dep.addSub(Dep.target)
        console.log('我是' + key)
        return value                    // 这里要用闭包中的 value，不能 data[key] 否则会无限递归
      },
      set: function(v) {
        if (value !== v) {
          console.log('我被设置了' + v)
          value = v
          dep.notify()
        }
        return value
      }
    })
  }
}


// 依赖收集器
class Dep {
  constructor() {
    this.subs = []
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(fn => fn.update())
  }
}

// 观察者
class Watcher {
  constructor(vm, exprOrFn, cb, isLazy) {
    this.vm = vm
    this.dirty = this.lazy = isLazy
    this.getter = typeof exprOrFn === 'function' ? exprOrFn : Util.createPathGetter(vm, exprOrFn)
    this.cb = cb
    this.value = this.lazy ? undefined : this.get()
  }
  get() {                       // touch getter 收集依赖
    Dep.target = this
    this.value = this.getter.call(this.vm)
    Dep.target = null
    return this.value
  }
  update() {
    if(this.lazy) {             // lazy watcher 也就是 计算属性的 watcher，只改变 dirty 标志
      this.dirty = true
    } else {
      let oldValue = this.value
      let newValue = this.getter.call(this.vm)      // 源码中这里是调用 get 重新整理依赖，这里就不搞那么复杂了
      if (newValue !== oldValue) {
        this.value = newValue
        this.cb(this.value, oldValue)
      }
    }
  }
}

// 模板编译器 此处直接编译为内存中的 文档片段。
// 源码则是编译成一个 anonymous 函数，返回 vnode
// 然后进行 dom diff，最后将变更应用至视图
class Compiler {
  constructor(el, vm) {
    let elem = Util.queryElem(el)
    this.vm = vm
    let fragment = this.node2fragment(elem)
    this.compile(fragment)
    elem.appendChild(fragment)
  }

  node2fragment(node) {
    let fragment = document.createDocumentFragment()
    let firstChild
    while (firstChild = node.firstChild) {
      fragment.appendChild(firstChild)        // appendChild 是移动节点而不是复制
    }
    return fragment
  }

  compile(fragment) {
    [...fragment.childNodes].forEach(child => {
      if(Util.isElementNode(child)) {
        this.compileAttrs(child)              // 处理 attributes
        this.compile(child)                   // 递归编译
      } else {
        this.compileText(child)
      }
    })
  }

  compileAttrs(node) {    // TODO

  }

  compileText(node) {                         // 文本节点，如 {{ d }}
    let content = node.textContent
    if (/\{\{(.+?)\}\}/.test(content)) {
      Util.text(node, content, this.vm)
    }
  }
}

// 工具包
const Util = {
  createPathGetter(vm, expr) {
    let pathArr = expr.split('.')
    return () => pathArr.reduce((prev, curr) => prev[curr], vm)
  },

  isElementNode(node) {
    return node.nodeType === 1               // 元素节点
  },

  queryElem(el) {
    return document.querySelector(el)
  },

  getContentValue(vm, keyPath) {
    return keyPath.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.createPathGetter(vm, args[1].trim())()
    })
  },

  text(node, key, vm) {
    let fn = Util.updater.textUpdater
    let cb = () => fn(node, this.getContentValue(vm, key))
    let text = key.replace(
      /\{\{(.+?)\}\}/g,
      (...args) => {
        let watcher = new Watcher(vm, args[1].trim(), cb)
        return watcher.value
      }
    )
    debugger
    fn(node, text)
  },

  updater: {
    // 处理文本节点
    textUpdater(node, value) {
      node.textContent = value
    }
  }
}