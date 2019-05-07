# redux 源码阅读

> redux 是一个状态容器

**核心概念**
- store 存储数据的仓库
- action 修改数据的动作描述
- reducer 修改数据的执行者

**三大原则**
- 单一数据源
- State 是只读的
- 使用纯函数来执行修改

## 基本使用
官方给出示例

```js
import { createStore } from 'redux'

// reducer, 形式为 (state, action) => state 的纯函数
// 要求 state 变化时返回全新的一份 state
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

// 创建 Redux store 来存放应用的状态。
// API 是 { subscribe, dispatch, getState }。
let store = createStore(counter)

// 可以手动订阅更新，也可以事件绑定到视图层。
store.subscribe(() => console.log(store.getState()))

// 改变内部 state 惟一方法是 dispatch 一个 action。
// action 可以被序列化，用日记记录和储存下来，后期还可以以回放的方式执行
store.dispatch({ type: 'INCREMENT' }) // 1
store.dispatch({ type: 'INCREMENT' }) // 2
store.dispatch({ type: 'DECREMENT' }) // 1
```

## createStore

createStore 方法用于创建仓库，接收 三个参数，`reducer, [preloadedState], enhancer`
- reducer

A function that returns the next state tree, given the current state tree and the action to handle.
一个 function, 根据当前state和action 返回一个新的 state

- [preloadedState]

The initial state. You may optionally specify it
to hydrate the state from the server in universal apps, or to restore a
previously serialized user session.
If you use `combineReducers` to produce the root reducer function, this must be
an object with the same shape as `combineReducers` keys.

初始状态树，可以用于水解从服务端来的状态（ssr应用）或重置之前序列化的用户会话状态。如果使用了 `combineReducer` 则 `key` 必须跟 `combineReducer` 传入的 `key` 一致！！

- [enhancer]

The store enhancer. You may optionally specify it
to enhance the store with third-party capabilities such as middleware,
time travel, persistence, etc. The only store enhancer that ships with Redux

允许我们使用第三方工具如中间件扩展 `redux`, 非常厉害！

```js
// src/createStore.js
export default function createStore(reducer, preloadedState, enhancer) {

  // ... 参数判断

  if (typeof enhancer !== 'undefined') {
    // ... 参数判断
    // enhancer 存在则传入 createStore 将其加强！！
    return enhancer(createStore)(reducer, preloadedState)
  }

  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false

  // ... 做了好多事

  // 获取 state, 在 dispatching 过程中不允许！！
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  // 订阅, 返回一个取关函数
  function subscribe(listener) {

    // ...
    nextListeners.push(listener)

    return function unsubscribe() {

      // ...
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  // 派发一个 action
  function dispatch(action) {

    // ... 参数判断

    try {
      isDispatching = true                                  // 标记正在派发 action 状态
      currentState = currentReducer(currentState, action)   // 走 reducer
    } finally {
      isDispatching = false                                 // 扳回标记
    }

    const listeners = (currentListeners = nextListeners)    // 通知所有订阅者
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  return {
    dispatch,
    subscribe,
    getState
  }
}
```

不难发现，`subscribe, dispatch` 两个 api 就是发布订阅模式的一个实现。`createStore` 就做了一点微小的事：有 enhancer 就调用 enhancer 把自己增强，保存状态 store 和回调队列 listeners, 返回三个函数（源码不止三个，暂时只关注这三个）

- `getState` 方法帮助我们获取 当前的数据状态
- `subscribe` 方法订阅数据仓库的更新
- `dipatch` 方法派发 `action`, 使用 `reducer` 走一遍仓库从而修改数据状态, 循环通知所有 `listener` 仓库状态有变化

## combineReducers
reducer 是一个修改 store 的纯函数，实际使用中一般会有多个 reducer 存在，需要使用 combineReducer 方法组合起来。

```js
export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (typeof reducers[key] === 'function') {             // 把是 function 的 reducer 滤出来
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  // This is used to make sure we don't warn about the same
  // keys multiple times.
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)                      // 把 reducer 走一遍
  } catch (e) {                                            // 要求 reducer 在初始化
    shapeAssertionError = e                                // 或接到不相干的 action
  }                                                        // 时都能正确的返回出初始 state

  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError                            // reducer 不符合要求则报错
    }


    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]                         // 把 reducer 的索引作为 key
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]                            // 记录每一个 reducer 走后的局部旧 state
      const nextStateForKey = reducer(previousStateForKey, action)      // 传入旧 state,action 造出新 state
      if (typeof nextStateForKey === 'undefined') {                     // 若有 reducer 把 state 变
        const errorMessage = getUndefinedStateErrorMessage(key, action) // 成 undefined 则报错
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey                                    // 记录每个 reducer 对应的新状态
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey  // 如果任一步 state 有变化
    }
    return hasChanged ? nextState : state                                 // 则返回变化后的全局 state
  }
}
```

可以看到，`combineReducers` 函数把所有 `reducer` 组合起来后返回一个 `combination` 执行器，他就像一个超级 `reducer`, 同样接收 `state`, `aciton` 两个参数。循环所有的小 `reducer`，并把其产生的新状态以其 `combine` 时的 `key` (一般是该 `reducer` 名)为 `key`，记录在 `nextState` 对象上，若有任何一个 `reducer` 改变了状态，则最终返回 `nextState` 对象，否则返回原有 `state` 不变。

一般使用时，我们将不同的模块的 `reducer` 按文件分开，组合所有 `reducer` 时使用 `combineReducer({ reducer1, reducer2... })` , 于是, `reducer1, reducer2` 就是 `finalReducerKeys` 中的项，也是 `nextState` 对象的键值。也就是说，全局 `state` 就是一个自带一级模块化的仓库，这点跟 `vuex` 主动声明 `module` 不同。

## applyMiddleware

可以说是贼强的一个 api 了！!

我们知道这个 api 接受中间件队列，先看一些 redux-thunk 中间件的源码:

```js
({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
}
```
什么是简洁！！什么是优雅！！什么是小而美哲学！！！朋友们，这！就！是！！！

中间件的通用写法就是一个三阶的高阶函数！！第一阶接收一个伪 `store` 也就是 `{ dispatch, getState }` 对象作为参数，可以获取 `state`, 派发 `action`；第二阶接受一个 `next` 高阶函数作为参数，调用此函数使中间件执行流程向后走；第三阶函数接收一个 `action` 也就是我们在业务代码中最终派发的 `action` 作为参数。

接下来回到 `applyMiddleware` 部分的源码

```js
export default function applyMiddleware(...middlewares) {           // 接收中间件队列
  return createStore => (...args) => {                              // 返回一个以 createStore 为入参的高阶函数
    const store = createStore(...args)                              // 调用 createStore 初始化全局状态树
    let dispatch = () => {                                          // 先给 dispatch 赋一个只会报错的 function
      throw new Error(                                              // 防止某些中间件不规范，在 compose 过程中派发 action
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {                                         // 制造一个伪 store 对象
      getState: store.getState,                                     // 给 中间件提供 getState, dispatch 方法
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))  // 循环一次消耗掉所有中间件的第一阶函数
    dispatch = compose(...chain)(store.dispatch)                    // compose 组合所有中间件，并 
                                                                    // 传入 dipatch 消耗掉所有中间件的第二阶函数
    return {                                                        // 最后返回一个加强了 dispatch 
      ...store,                                                     // 方法的 store
      dispatch
    }
  }
}
```

`applyMiddleware()` 函数执行返回一个以 createStore 为入参的高阶函数，也就是我们业务代码中使用的 `getState`. 我们调用时，先根据旧的 `createStore` 创建初始状态树, 然后对 `dispatch` 方法进行改造。

1. 给 `dispatch` 赋一个报错 `function`，以防止处理中间件队列过程中出现派发 `action` 的情况
2. 构造一个伪 `store` 对象，提供了 `getState, dispatch` 接口
3. 循环执行中间件队列，将伪 `store` 对象传入，消耗掉中间件的最外层函数，返回新的中间件队列
4. 使用 `compose` 组合处理后的中间件队列，并将组合执行一次传入 `store.dispatch`, 最终返回 一阶中间件队列的组合，作为新的 `dispatch` 方法
5. 返回一个加强了 `dispatch` 方法的 `store` 对象

那么最终，在业务代码中 dispatch 一个 action 时，执行的是中间件最内层的函数，利用闭包记住了 store————伪 store 对象，next————下一中间件的包装函数。

这里最精髓的自然是 `compose` 函数了

```js
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
精髓啊！！朋友们！！

`reduce` 方法将一组函数 `[a,b,c]` 挨个包装成高阶函数作为前一个函数的入参，注意了！！当我们执行这个结果时，执行顺序是 `c->b->a`, 我们可以写个示例自己验证下：
```js
compose(
	() => console.log('111'),
	() => console.log('222'),
	() => console.log('333')
)()

// '333'
// '222'
// '111'
```

那如果我们希望这一组函数的执行顺序按照传入的顺序执行怎么办？高阶函数！

```js
compose(
	next => v => { console.log('111' + v), next(v) },
	next => v => { console.log('222' + v), next(v) },
	next => v => { console.log('333' + v), next(v) }
)(
  v => console.log('I am dispatching' + v)
)(' hahahah')

// 111 hahahah
// 222 hahahah
// 333 hahahah
// I am dispatching hahahah
```

这也正解释了为何中间件是三层高阶函数！！


## 总结
`redux` 核心归结为几个点：仓库, 发布订阅, 以 `compose` 组合的中间件机制。

下面给各位观众表演一个用 18 行代码实现一个乞丐版 `redux`
```js
function createStore(reducer = v => v) {
  let store = {}
  let listeners = []
  let subscribe = (fn) => {
    let index = listeners.push(fn) - 1
    return () => listeners.splice(index, 1)
  }
  let dispatch = action => {
    store = reducer(store, action)
    listeners.forEach(fn => fn())
  }
  dispatch({})
  return {
    getStore: () => store,
    dispatch,
    subscribe
  }
}
```

再见！！