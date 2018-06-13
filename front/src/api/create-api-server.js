const isProd = process.env.NODE_ENV === 'production'
console.log('-----------> 进入了 server ' + isProd)

export default {
  host: 'http://127.0.0.1:8360' // '/proxyPrefix'
}
