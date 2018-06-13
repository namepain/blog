const isProd = process.env.NODE_ENV === 'production'
console.log('-------------> 进入了 client ' + isProd)

export default {
  host: isProd ? '/proxyPrefix' : 'http://localhost:8360'
}
