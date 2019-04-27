# webpack 安装
```
yarn add webpack webpack-cli -D
```

# 基本配置
```
let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let OptimizeCss = require('optimize-css-assets-webpack-plugin');
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let webpack = require('webpack');

module.exports = {
  optimization:{ // 优化项
    minimizer:[
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true 
      }),
      new OptimizeCss()
    ]
  },
  mode: 'development', 
  entry: './src/index.js',
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename:'main.css'
    })
  ],
  module: { 
    rules: [
      
      // loader 默认 是从右边向左执行 从下到上
      // {
      //   test:/\.js$/,
      //   use:{
      //     loader:'eslint-loader',
      //     options:{
      //        enforce:'pre' // previous   post
      //     }
      //   }
      // },
      {
        test:/\.js$/, // normal 普通的loader
        use:{
          loader:'babel-loader',
          options:{ // 用babel-loader 需要把es6-es5
            presets:[
              '@babel/preset-env'
            ],
            plugins:[
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ["@babel/plugin-proposal-class-properties", { "loose": true }],
              "@babel/plugin-transform-runtime"
            ]
          }
        },
        include:path.resolve(__dirname,'src'),
        exclude:/node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', 
          'postcss-loader',
          'less-loader'
        ]
      }
    ]
  },
  devServer: { // 开发服务器的配置
    port: 3000,
    progress: true,
    contentBase: './build',
    compress: true
  },
}
```
## 处理 es6 语法
我们希望把 es6 转为 es5，根据 `@babel/preset-env`。

`@babel/runtime` 能提供新语言特性的 `helper` 函数，例如 `class` 特性的 `_classCallCheck`。然而在不同模块同时使用 `class` 时各个模块会各自引用 `_classCallCheck` 函数造成代码冗余。 `@babel/plugin-transform-runtime` 保证引入 `helper` 函数且各个模块不重复引入依赖的 `helper。`

然而一些实例上的方法如 `Array.prototype.includes` 并不能被 `@babel/runtime` 模拟, 所以我们需要 `@babel/polyfill`，而直接`require('@babel/polyfill')`会完整模拟es5环境增加无需的依赖。此时可配置 `@babel/preset-env` 的 [useBuiltIns](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) 为 `useBuiltIns: 'usage'`。 ( 尝试发现，设置了这个后，代码中都不需要手动 `require('@babel/polyfill')` 引入了，但需要安装依赖 )

参考 [vue-cli 文档](https://cli.vuejs.org/zh/guide/browser-compatibility.html#usebuiltins-usage) 的做法
```
yarn add babel-loader @babel/core @babel/preset-env -D

yarn add @babel/plugin-transform-runtime -D
yarn add @babel/runtime

yarn add @babel/polyfill

{
  test: /\.js$/,
  use: {
    loader: 'babel-loader', // 转换 es6 到 es5
    options: {
      presets: [
        ['@babel/preset-env', { useBuiltIns: 'usage' }]
      ],
      plugins: [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        "@babel/plugin-transform-runtime"
      ]
    }
  },
  exclude: /node_modules/ // 排除 node_modules
}
```

## 全局变量 $
当我们希望引入一个全局变量有三种方式

- `expose-loader` 暴漏到 `window` 上

```
// import 时使用内联 loader
import $ from 'expose-loader?$!jquery'

// or 配置 loader

{
  test: require.resolve('jquery'),
  use:'expose-loader?$'
}
```
- `providePlugin` 给每个模块提供一个$
```
// 此时模块内可使用 $, window 上没有 $
new webpack.ProvidePlugin({ // 给每个模块提供一个 $
  $: 'jquery'
})
```

- `html` 内 `script` 引入，模块内引入不打包
```
// webpack 不打包 jQuery
externals: {
    jquery: "$"
}
```

## 图片处理

`file-loader` 解析图片成一个单独的图片文件，`url-loader` 将图片文件转为 `base64` 格式
```
{
  test:/\.(png|jpg|gif)$/,
  // 做一个限制 当我们的图片 小于多少k的时候 用base64 来转化
  // 否则用file-loader产生真实的图片
  use:{
    loader: 'url-loader',
    options:{
      limit:1,
      outputPath: '/img/',
      publicPath: 'http://www.xxxx.com'
    }
  }
}
```
一种特殊情况，在 html 文件中引用了 image 图片时，使用 `html-withimg-loader` 加载图片
```
{
  test:/\.html$/,
  use:'html-withimg-loader'
}
```

## 多页应用
通过将 `entry` 配置为对象打包多页应用, 同时可以通过 `new` 多个 `HtmlWebpackPlugin` 提供不同的 `html` 模板
```
let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  // 多入口
  mode: 'production',
  entry: {
    home: './src/index.js',
    other: './src/other.js'
  },
  output: {
    // [name] home,other
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'home.html',
      chunks: ['home']
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'other.html',
      chunks: ['other']
    })
  ]
}
```

## source-map 配置
source-map 配置能帮助我们打包出源文件，调试线上代码很方便

```
let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'production',
  entry: {
    home: './src/index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  // 1) 源码映射 会单独生成一个sourcemap文件 出错了 会标识 当前报错的列和行 大 和 全
  // devtool:'source-map', // 增加映射文件 可以帮我们调试源代码
  // 2) 不会产生单独的文件 但是可以显示行和列
  // devtool:'eval-source-map',
  // 3)  不会产生列 但是是一个单独的映射文件
  // devtool:'cheap-module-source-map', // 产生后你可以保留起来
  // 4) 不会长生文件 集成在打包后的文件中 不会产生列
  devtool:'cheap-module-eval-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    })
  ]
}
```

## 三个功能小插件 cleanWebpackPlugin，copyWebpackPlugin，bannerPlugin
当我们打包时可能需要先清除一些文件如 dist 目录; 打包时可能需要拷贝一些静态文件如微信开发时的鉴权 .txt 文件; 亦或是想在打包后的文件中留下到此一游的痕迹

```
let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: { home: './src/index.js', },
  module: {
    rules: [
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
    // new CleanWebpackPlugin('./dist'),
    // new CopyWebpackPlugin([ // 拷贝插件
    //   {from:'doc',to:'./'}
    // ]),
    // new webpack.BannerPlugin('welcome')
  ]
}
```

## 跨域问题
开发时我们可能遇到跨域问题，可以直接通过 devServer 解决，也可单独起一个服务解决。本质都是服务器代理。
```
devServer:{
    // 1
    // proxy:{ // 重写的方式 把请求代理到 服务器上
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     pathRewrite: { '/api': '' }
    //   }
    // }
    // 2 只需要模拟一些数据
    // before(app){ // 提供的方法 钩子
    //   app.get('/user',(req,res)=>{
    //     res.json({ name:  'before' })
    //   })
    // }
},
// 3) 单独起一个 node 服务编译 webpack 

let express = require('express');
let app = express();
let webpack = require('webpack');

// 中间件
let middle = require('webpack-dev-middleware');

let config = require('./webpack.config.js');

let compiler = webpack(config);

app.use(middle(compiler));

app.get('/user',(req,res)=>{
  res.json({ name: 'name' })
})

app.listen(3000);

```

## resolve 别名
```
resolve:{ // 解析 第三方包 common
  modules: [path.resolve('node_modules')],
  extensions: ['.js','.css','.json','.vue'],
  // mainFields: ['style','main']
  // mainFiles: [], // 入口文件的名字 index.js
  // alias:{ // 别名 vue vue.runtime
  //   bootstrap: 'bootstrap/dist/css/bootstrap.css'
  // }
},
```

## 定义环境变量

```
new webpack.DefinePlugin({
  DEV: JSON.stringify('production'),   // console.log('dev')
  FLAG: 'true',
  EXPORESSION: JSON.stringify('1+1')
})
```

## 根据不同环境区分配置
一般可以根据开发和生产环境分出三个配置文件, 使用 `smart` 合并。最后使用 `webpack -- --config webpack.prod.js` 或者在 `package.json` 中配置 `"build": "webpack --config webpack.prod.js"` 运行生产环境下的打包配置
```
// webpack.dev.js
let {smart} = require('webpack-merge');
let base = require('./webpack.base.js');

module.exports = smart(base,{
   mode: 'development',
   devServer:{ },
   devtool:'source-map'
})

// webpack.prod.js
let {smart} = require('webpack-merge');
let base = require('./webpack.base.js');

module.exports = smart(base,{
   mode: 'production',
   optimization:{
     minimizer:[ ]
   },
   plugins:[ ]
})

// webpack.base.js
// ...
```

# 优化配置

## noParse
防止 webpack 解析指定文件的依赖关系，忽略大型的 library 可以提高构建性能。
```
module: {
  noParse: /jquery/, // 不去解析jquery中的依赖库
}
```

## Ignoreplugin
忽略某些文件，比如 `moment` 的很多语言包
注意：此时需要手动引入所需的语言包
```
// Ignore all locale files of moment.js
new webpack.IgnorePlugin(/^\.\/locale$/, /moment/)

// 手动引入所需要的语言包
import 'moment/locale/zh-cn'
```

## dllPlugin
单独搞一个 `webpack.dll.js` 配置文件并运行 `npx webpack --config webpack.dll.js` 在 `dist` 目录下生成 bundle 文件，并在 html 模板中引入
```
let path = require('path');
let webpack = require('webpack');
module.exports = {
  mode: 'development',
  entry: {
    react: ['react', 'react-dom'],
  },
  output: {
    filename: '_dll_[name].js', // 产生的文件名
    path: path.resolve(__dirname, 'dist'),
    library: '_dll_[name]', // _dll_react
    //libraryTarget: 'var' // commonjs var this umd ...
  },
  plugins: [
    new webpack.DllPlugin({ // name == library
      name: '_dll_[name]',
      path: path.resolve(__dirname, 'dist', 'manifest.json')
    })
  ]
}


// html 模板
<script src="_dll_react.js"></script>
```

正常打包时还需要配置 `DllReferencePlugin` 
```
new webpack.DllReferencePlugin({
  manifest: path.resolve(__dirname, 'dist', 'manifest.json')
}),
```


## happypack
多线程打包，提高打包速度。

如果项目不大，速度反而会变慢！
```
let Happypack = require('happypack');

module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      include: path.resolve('src'),
      use: 'Happypack/loader?id=js'   // 这里 use happypack
    },
    {
      test: /\.css$/,
      use: 'Happypack/loader?id=css'  // 这里 use happypack
    }
  ]
}

plugins: [
  new Happypack({
    id: 'css',                        // 这里 id 跟上面 id=css 对应
    use: ['style-loader', 'css-loader']
  }),
  new Happypack({
    id: 'js',                         // 这里 id 跟上面 id=js 对应
    use: [{
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ]
      }
    }]
  })
]
```

## splitChunks 抽离公共代码
把被复用多次的依赖抽离出来

```
module.exports = {
  // ...
  optimization:{              // commonChunkPlugins
    splitChunks:{             // 分割代码块
      cacheGroups:{           // 缓存组
        common:{              // 公共的模块
          chunks:'initial',
          minSize:0,
          minChunks:2,
        },
        vendor:{
          priority: 1,          // 权重，先抽这个
          test: /node_modules/, // 把你抽离出来
          chunks: 'initial',
          minSize: 0,
          minChunks: 2
        }
      }
    }
  },

  // ...
}
```

## tree shaking, scope hoisting
这俩都是 `webpack` 自带的

`tree shaking`: 使用 `import` 语法引入, `webpack` 自动 `shake` 掉不需要的部分

`scope hoisting`: 分析出模块或变量之间的依赖关系，尽可能的把打散的模块或变量合并到一个函数或语句中去，但前提是不能造成代码冗余。 因此只有那些被引用了一次的模块或变量才能被合并。这样带来两个好处：① 文件体积比之前更小。
② 运行代码时创建的函数作用域也比之前少了，开销也随之变小。

## 启用热更新

```
devServer: {
  hot:true, // 启用热更新
  // ...
}

new webpack.NamedModulesPlugin(), // 打印更新的模块路径
new webpack.HotModuleReplacementPlugin() // 热更新插件

// src/index.js
import str from './source';
console.log(str);
if(module.hot){
  module.hot.accept('./source',()=>{
    let str = require('./source')
    console.log(str);
  })
}
```

## 懒加载
通过 `import()` 方法动态引入模块，使用 `@babel/plugin-syntax-dynamic-import` 转换

```
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      include: path.resolve('src'),
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react'
          ],
          plugins:[
            '@babel/plugin-syntax-dynamic-import'
          ]
        }
      }
    },
  ]
},

import('./source.js').then(data=>{
  console.log(data.default);          // 注意 es6 模块取 .default
})
```