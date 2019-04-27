# 实现一个简单的 webpack

`webpack` 的原理简单理解起来并不复杂，无非是从入口出发递归寻找所有模块，最终将所有依赖打包成一个 `bundle`, 这个 `bundle` 里只有一个立即执行函数，函数体内实现了一个类 `commonjs` 规范的依赖加载器，函数的入参则是由所有的模块组成的键值对。

```
(function (modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }
  return __webpack_require__("./src/index.js");                 // 入口文件的 id
})
  ({
    "./src/a.js":
      (function (module, exports, __webpack_require__) {
        eval("__webpack_require__(/*! ./b.js */ \"./src/b.js\")\r\n\r\nconsole.log(1)\n\n//# sourceURL=webpack:///./src/a.js?");
      }),
    "./src/b.js":
      (function (module, exports) {
        eval("\r\nconsole.log('b')\n\n//# sourceURL=webpack:///./src/b.js?");
      }),
    "./src/index.js":
      (function (module, exports, __webpack_require__) {
        eval("__webpack_require__(/*! ./a.js */ \"./src/a.js\")\n\n//# sourceURL=webpack:///./src/index.js?");
      })
  });
```

那么 `webpack` 的实现思路就是根据这个输出结果创建一个 `ejs` 文件作为模板然后从 `webpack.config.js` 配置的入口出发递归读取所有模块，并将所有资源循环渲染到模板文件的函数体。

可以注意到，模板中有几个重要的点：
  - 入口文件的 `id`
  - 所有模块。包括模块 `id` 即模块的相对路径，模块内容使用 `eval()` 函数包裹
  - `require` 方法替换为 `__webpack_require__` 方法, 其引用的路径也是 相对路径

## 测试用例
新建一个简单的项目帮助测试 `mypackDemo`
```
  |
  |-src
  |   |
  |   |---index.js
  |   |---a.js
  |   |---b.js
  |-webpack.config.js
```
添加基本配置
```
// webpack.config.js
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```

## compiler
新建一个 mypack 项目, 初始化项目, 修改 package.json 的 bin 参数，使其执行 bin/my-pack.js 文件
```
// 命令行执行
npm init -y

// package.json 中添加
"bin": {
  "pack": "./bin/my-pack.js"
}

// my-pack.js 测试内容
#! /usr/bin/env node

console.log('我好了！！')

// 命令行执行 npm link 将 pack 命令链接到全局
npm link

// 切换到 mypackDemo 项目执行 npm link pack, 
// 而后就可以执行 npx pack 调用 mypack 项目了
npm link pack
```
`my-pack.js` 做的事情非常简单, 加载配置文件, `new` 一个 `Compiler` 类实例用于编译我们的配置文件, 编译后执行构建。
```
#! /usr/bin/env node                      // 告诉系统可以在PATH目录中查找 node 来执行你的脚本文件

// 1 找到 webpack.config.js
let path = require('path')
let config = require(path.resolve('webpack.config.js'))

// 2 编译配置并执行
let Compiler = require('../lib/Compiler.js')
let compiler = new Compiler(config)
compiler.run()
```

实现 Compiler 类，保存好传入的配置，并提供 `run` 方法

```
class Compiler {
  constructor(config) {
    this.config = config              // 保存
    this.entryId;                     // 入口 id
    this.entry = config.entry         // 入口路径
    this.modules = {}                 // 所有的依赖
    this.root = process.cwd()         // 当前工作路径，作为改造相对路径的依据
  }

  run() {

    // 构建所有模块，提供入口文件路径
    this.buildModule(path.resolve(this.root, this.entry), true)

    // 渲染最后的 bundle, 完成打包
    this.emitFile()
  }

  buildModule (modulePath, isEntry) {
    let source = fs.readFileSync(modulePath, 'utf-8')               // 模块内容
    let moduleName = './' + path.relative(this.root, modulePath)    // 模块id
    
    if(isEntry) {
      this.entryId = moduleName                   // 保存最初入口的键名
    }

    // 把替换模块内 require() 成 _webpack_require(), 并返回依赖列表
    let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName))

    this.modules[moduleName] = sourceCode         // 把相对路径跟模块内容对应

    dependencies.forEach(item => {                // 递归加载
      this.buildModule(path.join(this.root, item))
    })
  }
}
```

那么我们怎么知道他用了 `require` 语法加载依赖呢，这里便要使用到 `babylon` 这个库了。

这个库可以帮我们解析 `ast` 语法树，配合 `traverse` 库帮我们访问到使用了 `require` 语法的节点，从而可以将此替换成我们需要的 `__webpack_require__` 语法, 最后使用 `generator` 这个库重写生成改造后的代码, 完成代码的转换。

```
const t = require('@babel/types')
const babylon = require('babylon')
const traverse = require('@babel/traverse').default     // es6 语法
const generator = require('@babel/generator').default   // 需要 .default

parse(source, parentPath) {
  let ast = babylon.parse(source)                       // 解析 ast
  let dependencies = []                                 // 保存依赖列表
  traverse(ast, {                                       // 访问语法树
    CallExpression(p) {
      let node = p.node                                 // 对应的节点
      if (node.callee.name === 'require') {             // 是 require 的节点
        node.callee.name = '__webpack_require__'
        let moduleName = node.arguments[0].value        // 模块引用的名字
        moduleName += (path.extname(moduleName) ? '' : '.js')
        moduleName = './' + path.join(parentPath, moduleName)   // 改造地址
        dependencies.push(moduleName)

        node.arguments = [t.stringLiteral(moduleName)]  // 把参数再装填进去
      }
    }
  })

  let sourceCode = generator(ast).code                  // 根据改造后的 ast 生成代码
  return { sourceCode, dependencies }
}
```

经过以上几步，代码的转换工作基本搞定，那么还需要把转换后的代码输出出来

```
emitFile() {
  // 找到配置的输出文件名
  let main = path.join(this.config.output.path, this.config.output.filename)

  // 找到准备好的模板
  let template = fs.readFileSync(path.join(__dirname, 'main.ejs'), 'utf-8')

  // 使用 ejs 渲染
  let code = ejs.render(template, { entryId: this.entryId, modules: this.modules })

  // 最终把代码写到输出文件里
  fs.writeFileSync(main, code)
}
```

简单的打包功能就此完成。在 `mypackDemo` 项目中执行 `npx pack` 验证打包后的输出文件.

## loader
loader 的本质就是一个 function, 用于加载指定的文件。

```
// webpack.config.js
module: {
  rules: [
    {
      test: /\.less$/,              // 匹配 less 文件
      use: [
        path.resolve(__dirname,'loader','style-loader'),  // 使用 style loader 加载
        path.resolve(__dirname,'loader','less-loader')    // 使用 less loader 加载
      ]
    }
  ]
}
```

改造 buildModule 读取文件的过程
```
-   let source = fs.readFileSync(modulePath, 'utf-8')
+   let source = this.getContent(modulePath)

getContent(contentPath) {
  let rules = this.config.module.rules                    // 找到 rules
  let content = fs.readFileSync(contentPath, 'utf-8')     // 读取文件
  
  rules.forEach((rule, i) => {                            // 循环匹配相应的 rule
    let { test, use } = rule
    let len = use.length - 1
    if (test.test(contentPath)) {                         // 命中 loader
      function normalLoader() {
        let loader = require(use[len--])                  // loader 从后向前执行
        content = loader(content)
        if (len >= 0) {
          normalLoader()                                  // 递归所有 loader
        }
      }
      normalLoader()
    }
  })
  return content                                          // 返回 loader 改造完的内容
}
```

简单的实现 `less-loader` 和 `style-loader`
```
// less loader
let less = require('less');                               // 使用 less 模块
function loader(source){
  let css = '';
  less.render(source,function (err,c) {                   // render 改造 less 内容
    css = c.css;
  });
  css = css.replace(/\n/g,'\\n');       // 由于最后输出到字符串, \n 会被解析为 n,
  return css;                           // 所以需要两次转义 \\n
}
module.exports = loader

// style loader
function loader(source) {               // 将样式插入 head 标签
  let style = `
    let style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style);
  `
  return style;
}
module.exports = loader;
```
简单的 loader 工作也已完成。

## plugin
`plugin` 一般是一个类，通过 `new` 实例并调用实例的 `apply` 方法传入 `compiler` 实例使其发挥作用

写一个极简的 `plugin`, 添加 `webpack` 配置
```
class P{
  apply(compiler){
    compiler.hooks.emit.tap('emit',function () {
      console.log('emit hook -----');
    })
  }
}

module.exports = {
  plugins: [
    new P()
  ]
}
```

改造 `compiler`
```
let { SyncHook } = require('tapable')

// 改造构造器
constructor(config) {
  // ...

  // 添加钩子
  this.hooks = {
    compile: new SyncHook(),
    afterCompile: new SyncHook(),
    afterPulgins: new SyncHook(),
    run: new SyncHook(),
    emit: new SyncHook(),
    done: new SyncHook()
  }

  // 如果传递了 plugins 参数, 依次调用 apply 方法把实例传入
  let plugins = this.config.plugins
  if(Array.isArray(plugins)) {
    plugins.forEach(plugin => {
      plugin.apply(this)
    })
  }
  this.hooks.afterPulgins.call()        // 调用钩子
}

// 改造 run, 在合适的实际发布事件
run() { 
  // 发布 run compile 事件
  this.hooks.run.call()
  this.hooks.compile.call()

  // 执行并创建木块的依赖关系
  this.buildModule(path.resolve(this.root, this.entry), true)

  // 发布 afterCompile 事件
  this.hooks.afterCompile.call()

  // 发射打包后的文件
  this.emitFile()

  // 发射 emit done 事件
  this.hooks.emit.call()
  this.hooks.done.call()
}
```

简单的 `plugin` 机制便也实现。

## 总结
- `webpack` 打包原理就是根据语法分析结果, 递归的查找依赖并将所有依赖循环渲染至一个实现了本地 `commonjs` 模块加载机制的 `bundle` 文件中
- `loader` 本质是一个函数, 入参为匹配的文件内容, 输出转换后的文件内容
- `plugin` 是一个提供了 `apply` 方法的类, 通过订阅相关的事件在合适的时机发挥作用。