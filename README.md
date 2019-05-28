
## 文章列表

- [手写实现Promise](./blogs/实现%20Promise/实现promise原理.md)
- [Vue中的watcher](./blogs/实现%20Vue/vue中的watcher.md)
- [实现简单的Vue](./blogs/实现%20Vue/index.js)
- [实现简单的Vuex](./blogs/实现%20Vuex/实现简单的Vuex.md)
- [如何实现dom diff](./blogs/domdiff/如何实现dom%20diff.md)
- [http的一些概念](./blogs/HTTP/http概念.md)
- [http缓存](./blogs/HTTP/http缓存.md)
- [koa源码阅读](./blogs/koa2/koa2源码阅读.md)
- [redux源码阅读](./blogs/redux源码阅读/redux源码阅读.md)
- [webpack常用配置](./blogs/webpack/配置webpack.md)
- [webpack简单实现](./blogs/webpack/实现webpack.md)
- [h5适配方案](./blogs/h5适配方案.md)

-----

Vue SSR blog
> 这是一个基于 Vue SSR 的 blog 项目

本项目前端使用 Vue SSR 技术 ，后台管理界面使用 element-ui 组件库，后端使用 node 框架 thinkJS 提供数据服务，数据库使用了 mysql 存储。

~~项目预览地址点这里~~ (没钱买服务器了)

本地开发需要起三个服务
  - 前端 Vue SSR 起 node 服务在 8080 端口
  - 后台管理 起开发服务 在 8090 端口 （只开发前端时也可不起）
  - 后端 thinkJS 服务起在 8360 端口

为了上线时不用再单独配置 nginx, 可以在开发时就使用 nginx 代理。

# 前端 front

安装及运行
```
cd front
npm install
npm run dev
```
注意此时可能还不能访问，因为 backend 后端数据服务还没起。

# 后台管理 admin

安装及运行
```
cd admin
npm install
npm run dev
```
此时访问也需要起 backend 后端服务

# 后端服务 backend

安装及运行
```
cd backend
npm install
npm start
```
注意确保数据库服务已经起好了才可进行数据访问

# nginx 配置

上线后 nginx 监听 80 端口，将访问请求转发至 8080 端口（也就是 vue ssr 前端），
ssr 在服务器发送数据请求访问 127.0.0.1:8360，返回渲染完成的页面。而后客户端请求则是 '/proxyPrefix***' 被代理到 127.0.0.1:8360。

需要注意的是，文章中上传的图片需要单独加一段 nginx 配置，因为 thinkJS 只在开发环境默认开启静态资源中间件，而在正式环境更提倡使用 nginx 代理资源。详见 nginx.conf

# 其他

本博客项目设计多有借鉴参考 [Smallpath](https://smallpath.me/) 大神的 [博客项目](https://github.com/smallpath/blog), 在此鸣谢！！
