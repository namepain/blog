# koa2 源码阅读

koa2 一个轻量级基于 nodeJs 的 web 框架。真的很轻，主要就三个点：
- 封装请求上下文
- 洋葱中间件
- 错误处理

## application

构造函数中准备好 `middleware` 中间件队列, `context request response` 原型, 其上提供了一些方便我们处理请求的工具
```js
class Application extends Emitter {
  constructor() {
    super();

    this.proxy = false;
    this.middleware = [];                               // 存中间件队列
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);              // 上下文原型
    this.request = Object.create(request);              // 请求原型
    this.response = Object.create(response);            // 响应原型
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }

  listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());  // 起一个 http 服务
    return server.listen(...args);
  }
}
```
`app.listen()` 就是 `httpServer` `listen` 起一个 http 服务, 而回调则是 `this.callback()` 返回的函数, 这个函数里对中间件做了 `compose` 操作并返回一个能对请求做处理的函数。

```js
callback() {
  const fn = compose(this.middleware);                    // 组合中间件
  
  // 如果没有定义 error 回调，则注册 this.onerror 默认处理
  if (!this.listenerCount('error')) this.on('error', this.onerror);

  const handleRequest = (req, res) => {
    const ctx = this.createContext(req, res);             // 构造当次请求的请求上下文
    return this.handleRequest(ctx, fn);                   // 把 ctx, next 传入
  };

  return handleRequest;
}

handleRequest(ctx, fnMiddleware) {
  const res = ctx.res;
  res.statusCode = 404;
  const onerror = err => ctx.onerror(err);                // 错误处理
  const handleResponse = () => respond(ctx);              // 响应处理
  onFinished(res, onerror);
  return fnMiddleware(ctx).then(handleResponse).catch(onerror); // 错误处理
}

onerror(err) {
  if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

  if (404 == err.status || err.expose) return;
  if (this.silent) return;

  const msg = err.stack || err.toString();                // 打印错误信息
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
}
```

可以看到在构造好单次请求的请求上下文后，会传入 `ctx, fn` 两个参数, 这也就是 `koa` 中间件所接受的两个参数 `ctx, next`。

## compose

`compose` 就是 `koa` 中间件机制的核心了, 它将中间件队列组合起来成为一个洋葱圈, 每个中间件可以通过 `next` 控制执行流程是否继续。

```js
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {              // 中间件必须是函数
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    // last called middleware #
    let index = -1                            // index 记录中间件执行的索引
    return dispatch(0)                        // 调用第一个中间件
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))                                // next 避免调用多次
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next  // 最后一个中间件, koa 里 next 是 undefined 
      if (!fn) return Promise.resolve()       // 最后一个中间件则 resolve
      try {                                   // 捕获异常用 promise 抛上去
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));  // 递归调用下一个中间件
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

## onerror

上文 `handleRequest` 方法中 `onerror` 执行的是 `ctx` 中定义的 `onerror`, 这个方法里会 `emit` 一个 `error` 事件, 方便用户进行错误处理

```js
 onerror(err) {
    if (null == err) return;

    if (!(err instanceof Error)) err = new Error(util.format('non-error thrown: %j', err));

    let headerSent = false;
    if (this.headerSent || !this.writable) {
      headerSent = err.headerSent = true;
    }

    // delegate
    this.app.emit('error', err, this);              // 发射 error 事件

    if (headerSent) {
      return;
    }

    const { res } = this;

    if (typeof res.getHeaderNames === 'function') {   // 报错就移除所有 header
      res.getHeaderNames().forEach(name => res.removeHeader(name));
    } else {
      res._headers = {}; // Node < 7.7
    }

    // then set those specified
    this.set(err.headers);

    // force text/plain
    this.type = 'text';                               // 强制返回 text 类型

    // ENOENT support
    if ('ENOENT' == err.code) err.status = 404;       // 没有指定响应码默认 404

    // default to 500
    if ('number' != typeof err.status || !statuses[err.status]) err.status = 500;

    // respond
    const code = statuses[err.status];
    const msg = err.expose ? err.message : code;
    this.status = err.status;
    this.length = Buffer.byteLength(msg);
    res.end(msg);                                     // 响应错误信息回去
  }
```

基本脉络差不多就这样，精髓就在于 `compose` , 他与 `redux` 的 `compose` 有些不同。 `redux` 使用 `reduce` 函数一行代码将一组函数组合起来， 而 koa 为了做更好的错误处理使用递归调用下一中间件的形式。

其在业务代码上的书写差异是： redux 中间件需要至少是二阶的高阶函数, 以保证中间件执行顺序是按照中间件传入顺序； 而 koa 中间件则不必是高阶函数，但最好是 `async` 函数(不是必须), 以便使用 `await next()` 调用后续函数，毕竟你无法知道后续函数中是否有 `async` 的中间件，所以大家都 `async` 就好了.

```js
// redux
function compose(...fns) {
  return fns.reduce((a, b) => (...args) => a(b(...args)))
}

// koa
function compose(...fns) {
  return (ctx, next) => {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i < index) {
        return Promise.reject(new Error('next() called multiple times'))
      }
      index = i;
      let fn = fns[i]
      if (i === fns.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)))
      } catch(e) {
        return Promise.reject(e)
      }
    }
  }
}
```

### 下面再用 20 行代码给大家表演一个乞丐版 koa

```js
const http = require('http')

class koa {
  constructor() {
    this.middlewares = []
  }

  use(fn) {
    this.middlewares.push(fn)
  }

  listen(...args) {
    let server = http.createServe((req, res) =>{
      let ctx = { req, res }
      let dispatch = (i) => this.middlewares[i](ctx, dispatch.bind(null, i + 1))
      dispatch(0)
    })
    server.listen(...args)
  }
}
```

再见！！