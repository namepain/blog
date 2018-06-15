Vue SSR blog
> 这是一个基于 Vue SSR 的 blog 项目

本项目前端使用 Vue SSR 技术 ，后台管理界面使用 element-ui 组件库，后端使用 node 框架 thinkJS 提供数据服务，数据库使用了 mysql 存储。

<a href="http://curryadd.com/" target="_blank">项目预览地址点这里</a>

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
