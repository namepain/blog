# 从入门到实现 Vue3 Function-based API
>不久前的 vue conf 上尤雨溪发布了 Vue Function-based API, 这是 3.0 最重要的变化。实际上基于 Vue2 的核心 API, 我们已经能够实现 Function-base 的 API 写法, 从而使得开发者能提前适应 3.0, 面向未来编程！

## 设计动机
*逻辑的组合与复用* 一直是组件化的核心意义之一，然而现有的逻辑复用模式或多或少存在一些问题。如以下模式：
- Mixins
- HOC(Higher-order Components 高阶组件)
- Renderless Components (基于 scoped slots / 作用域插槽封装逻辑的组件）

他们存在这样一些问题：
- 数据来源不清晰。多个Mixins 或多个 HOC 一起使用时，很难分清数据来源于哪个 Mixins 或 HOC。
- 命名空间冲突。不同开发者写的 Mixins 和 HOC 无法保证命名空间不冲突。
- 性能开销。HOC 和 Renderless Components 都需要额外的组件实例嵌套来封装逻辑。

而 Function-based API 让我们把相关联的逻辑代码抽取到一个 'composition function'(组合函数)中，可以暴露给组件响应式的数据源。以下是官方给出的一个封装鼠标位置侦听的例子：
```js
function useMouse() {
    const x = value(0)
    const y = value(0)
    const update = e => {
        x.value = e.pageX
        y.value = e.pageY
    }
    onMounted(() => {
        window.addEventListener('mousemove', update)
    })
    onUnmounted(() => {
        window.removeEventListener('mousemove', update)
    })
    return { x, y }
}

// 在组件中使用该函数
const Component = {
  setup() {
    const { x, y } = useMouse()
    // 与其它函数配合使用
    const { z } = useOtherLogic()
    return { x, y, z }
  },
  template: `<div>{{ x }} {{ y }} {{ z }}</div>`
}
```
可以看到以下优点：
- 数据来源清晰，就像普通的函数调用
- 返回值何以被重命名，解决了命名冲突
- 没有额外创建组件实例

除了逻辑组合复用之外，Function-based 还有着*类型推导*友好和*打包尺寸*友好的特点

## 设计细节

### setup() 函数
一个新的组件选项，初始化 props 后调用, 接受初始的 props 作为参数，内部可以使用 this。

setup() 可以返回一个对象，其属性可用于模板渲染，类似 data()
```js
import { value } from 'vue'

const MyComponent = {
  setup(props) {
    const msg = value('hello')
    const appendName = () => {
      msg.value = `hello ${props.name}`
    }
    return {
      msg,
      appendName
    }
  },
  template: `<div @click="appendName">{{ msg }}</div>`
}
```

### value wrapper/Unwrapping (对象的包装和展开)
原始类型如 number，string 无法被追踪后续变化，包装对象使得可以在函数之间以引用的方式传递任意类型的容器。调用时，使用 .value 获取包装对象的值，但在模板中包装对象会自动解包。

### 配合手写 Render 函数使用

```js
import { value, createElement as h } from 'vue'

const MyComponent = {
  setup(initialProps) {
    const count = value(0)
    const increment = () => { count.value++ }

    return (props, slots, attrs, vnode) => (
      h('button', {
        onClick: increment
      }, count.value)
    )
  }
} 
```

### Computed Value

对应 2.x 中的计算属性
```js
import { value, computed } from 'vue'

const count = value(0)
const writableComputed = computed(
    // read
    () => count.value + 1,
    // write
    val => {
        count.value = val - 1
    }    
)

console.log(writableComputed.value) // 1

count.value++
console.log(writableComputed.value) // 2
```

### Watchers

观察*包装对象*、*返回任意值的函数*或*包含前两种数据源的数组*
```js
const unWatch = watch(
  [valueA, () => valueB.value],
  ([a, b], [prevA, prevB], onCleanup) => {
    console.log(`a is: ${a}`)
    console.log(`b is: ${b}`)

    onCleanup(() => {
        // 取消还未完成的一些副作用
    })
  },
  // 定制选项
  {
    lazy: false,
    deep: false,
    flush: 'post'
    // flush: 'post', // default, fire after renderer flush
    // flush: 'pre', // fire right before renderer flush
    // flush: 'sync' // fire synchronously
    // onTrack?: (e: DebuggerEvent) => void
    // onTrigger?: (e: DebuggerEvent) => void
  }
)

// 停止观察
unWatch()
```
watch() 的回调会在创建时就执行一次。类似 2.x watcher 的 immediate: true 选项，但有一个重要的不同：默认情况下 watch() 的回调总是会在当前的 renderer flush 之后才被调用 —— 换句话说，watch()的回调在触发时，DOM 总是会在一个已经被更新过的状态下。 这个行为是可以通过选项来定制的。

如果 watch() 是在一个组件的 setup() 或是生命周期函数中被调用的，那么该 watcher 会在当前组件被销毁时也一同被自动停止

为什么watcher 的回调不返回一个清除副作用的函数，而是提供 onCleanup 方法？因为 watcher 回调的返回值在异步场景下有特殊作用，async function 隐性地返回一个 Promise - 这样的情况下，我们是无法返回一个需要被立刻注册的清理函数的。除此之外，回调返回的 Promise 还会被 Vue 用于内部的异步错误处理。
```js
const data = value(null)
watch(getId, async (id) => {
  data.value = await fetchData(id)
})
```

### 生命周期
所有现有的生命周期钩子都会有对应的 onXXX 函数（只能在 setup() 中使用）

```js
import { onMounted, onUpdated, onUnmounted } from 'vue'

const MyComponent = {
  setup() {
    onMounted(() => console.log('mounted!'))
    onUpdated(() => console.log('updated!'))
    // destroyed 调整为 unmounted
    onUnmounted(() => console.log('unmounted!'))
  }
}
```

### 依赖注入
```js
import { provide, inject } from 'vue'

const CountSymbol = Symbol()

const Ancestor = {
  setup() {
    // providing a value can make it reactive
    const count = value(0)
    provide({
      [CountSymbol]: count
    })
  }
}

const Descendent = {
  setup() {
    const count = inject(CountSymbol)
    return {
      count
    }
  }
}
```

## 如何实现

### setup
