const http = require('http')

class poorkoa {
  constructor() {
    this.middlewares = []
  }

  use(fn) {
    this.middlewares.push(fn)
  }

  listen(...args) {
    let server = http.createServer((req, res) => {
      let ctx = { req, res }
      let dispatch = i => this.middlewares[i](ctx, dispatch.bind(null, i + 1))
      dispatch(0)
    })
    return server.listen(...args)
  }
}

let koa = new poorkoa()

koa.use((ctx, next) =>{
  console.log('1...')
  next()
  console.log('1...')
})

koa.use((ctx, next) =>{
  console.log('2...')
  next()
  console.log('2...')
})

koa.use((ctx) =>{
  console.log('3...')
  ctx.res.end('欸嘿嘿嘿~~')
})

koa.listen(3000)

