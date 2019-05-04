const PENDING = 'pending'                           // 等待完成状态
const FULFILLED = 'fulfilled'                       // 完成状态
const REJECTED = 'rejected'                         // 失败状态

class Promise {
  constructor(fn) {
    this.status = PENDING                           // Promise 维持一个状态机，只有pending, fulfilled, rejected 三个状态
    this.value = undefined                          // fulfilled 时执行的结果
    this.reason = undefined                         // rejected 时 失败的原因
    this.onFulfilledCallbacks = []                  // fulfilled 时 执行的回调列表
    this.onRejectedCallbacks = []                   // rejected 时执行的回调列表

    let resolve = value => {
      if (this.status !== PENDING) return                   // 只允许 pending --> fulfilled
      this.status = FULFILLED                               // 状态 置为 fulfilled
      this.value = value                                    // 保存 value
      this.onFulfilledCallbacks.forEach(fn => fn(value))    // 循环回调
    }
    let reject = reason => {
      if (this.status !== PENDING) return                   // 只允许 pending --> rejected
      this.status = REJECTED                                // 状态 置为 rejected
      this.reason = reason                                  // 保存 rejected 原因
      this.onRejectedCallbacks.forEach(fn => fn(reason))    // 循环失败回调
    }

    try {
      fn(resolve, reject)                                   // 执行 执行器
    } catch(e) {
      reject(e)                                             // 执行器直接报错则 reject
    }
  }

  then (onFulfilled, onRejected) {
    // 做一个参数处理，onFullfilled 若不是函数，则变成函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    // onRejected 若不是函数则变为一个 throw 的函数
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    // then 方法返回一个 new Promise 以支持链式调用
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === PENDING) {                          // pending 状态则向 成功/失败回调 各推一个函数
        this.onFulfilledCallbacks.push((v) => {
          setTimeout(() => {                                  // 异步执行
            try {
              let x = onFulfilled(v)
              resolvePromise(promise2, x, resolve, reject)    // 对回调函数的值进行处理
            } catch(e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push((r) => {
          setTimeout(() => {
            try {
              let x = onRejected(r)
              resolvePromise(promise2, x, resolve, reject)
            } catch(e) {
              reject(e)
            }
          })
        })
      }

      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch(e) {
            reject(e)
          }
        })
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch(e) {
            reject(e)
          }
        })
      }
    })
    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  static resolve(p) {
    if (p instanceof Promise) return p
    return new Promise(resolve => resolve(p))
  }

  static reject(r) {
    return new Promise((_, reject) => reject(r))
  }

  finally(fn) {                                               // 必做的事，同时把 value reason 向后传
    return this.then(
      value => Promise.resolve(fn()).then(() => value),
      reason => Promise.resolve(fn()).then(() => { throw reason })
    )
  }

  all(promises) {                                       // 计数 必须所有 promise 都 resolve了 才能 resolve
    let i
    let len = promises.length
    let res = []
    return new Promise((resolve, reject) => {
      promises.forEach((p, index) => {
        Promise.resolve(p).then(                        // 传进来的数组项不是 promise 则转为 promise
          v => {
            i++
            res[index] = v
            if (i === len) {
              resolve(res)
            }
          },
          r => reject(r)
        )
      })
    })
  }

  race(promise) {                                       // 赛跑 有一个 resolve 就 resolve 了
    return new Promise((resolve, reject) => {
      promise.forEach(p => {
        Promise.resolve(p).then(                        // 传进来的数组项不是 promise 则转为 promise
          v => resolve(v),
          r => reject(r)
        )
      })
    })
  }

  try(fn) {
    return new Promise(resolve => {
      resolve(fn())                                     // 由于 excutor 被 try catch 包围， fn 执行如果报错 就会被 try catch 抓住直接 reject 了
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 循环引用 throw new TypeError()
  if (promise2 === x) {
    throw new TypeError('循环引用了')
  }

  // 是对象或函数，则判断其有没有 then 属性
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let then, called;
    try {
      then = x.then                                               // 注意：x.then 一定要放在 try 区域，防止 .then get 方法被重写，获取过程报错
      if (typeof then === 'function') {
        then.call(x, function(y) {
          if (called) return                                      // 防止 resolve 后 又被 reject
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, function(y) {
          if (called) return                                      // 防止 resolve 后 又被 reject
          called = true
          reject(y)
        })
      } else {
        resolve(x)
      }
    } catch(e) {
      if (called) return                                          // 防止 resolve 后 又被 reject
      called = true
      reject(e)
    }
  } else {
    // 普通类型直接 resolve
    resolve(x)
  }
}

Promise.deferred = Promise.defer = function() {                   // 提供适配器
  var defer = {}
  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
}

module.exports = Promise