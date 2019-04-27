const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
const t = require('@babel/types')
const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
let { SyncHook } = require('tapable')

class Compiler {
  constructor(config) {
    this.config = config
    // 找到入口
    this.entryId;
    // 找到入口路径
    this.entry = config.entry
    // 找到所有的依赖
    this.modules = {}
    // 当前工作路径
    this.root = process.cwd()

    // 钩子
    this.hooks = {
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPulgins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    }
    // 如果传递了plugins参数
    let plugins = this.config.plugins;
    if(Array.isArray(plugins)){
      plugins.forEach(plugin => {
        plugin.apply(this);
      });
    }
    this.hooks.afterPulgins.call();
  }

  run() { // 生命周期调用钩子
    this.hooks.run.call()
    this.hooks.compile.call()
    // 执行并创建木块的依赖关系
    this.buildModule(path.resolve(this.root, this.entry), true)
    this.hooks.afterCompile.call()

    // console.log(this.modules, this.entryId)
    // 发射打包后的文件
    this.emitFile()
    this.hooks.emit.call()
    this.hooks.done.call()
  }

  getContent(contentPath) {
    let rules = this.config.module.rules
    let content = fs.readFileSync(contentPath, 'utf-8')

    // 循环匹配相应的 rule, 调用 loader
    rules.forEach((rule, i) => {
      let { test, use } = rule
      let len = use.length - 1
      if (test.test(contentPath)) {
        function normalLoader() {
          let loader = require(use[len--])
          content = loader(content)
          if (len >= 0) {
            normalLoader()
          }
        }
        normalLoader()
      }
    })
    return content
  }

  buildModule (modulePath, isEntry) {
    // 模块内容
    let source = this.getContent(modulePath)
    // 模块id
    let moduleName = './' + path.relative(this.root, modulePath)
    // console.log(source, moduleName)

    // 保存最初入口的键名
    if(isEntry) {
      this.entryId = moduleName
    }

    // 替换模块内 require() 成 _webpack_require(), 并返回依赖列表
    let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName))

    // console.log(sourceCode, dependencies)

    // 把相对路径跟模块内容对应
    this.modules[moduleName] = sourceCode

    dependencies.forEach(item => {              // 递归加载
      this.buildModule(path.join(this.root, item))
    })
  }

  parse(source, parentPath) {
    // console.log(source, parentPath)
    let ast = babylon.parse(source)
    let dependencies = []
    traverse(ast, {
      CallExpression(p) {
        let node = p.node   // 对应的节点
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          let moduleName = node.arguments[0].value    // 模块引用的名字
          moduleName += (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName)
          dependencies.push(moduleName)

          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })

    let sourceCode = generator(ast).code
    return { sourceCode, dependencies }
  }

  emitFile() {
    let main = path.join(this.config.output.path, this.config.output.filename)
    // console.log('main------>' + main)
    let template = this.getContent(path.join(__dirname, 'main.ejs'))
    // console.log('template----------->' + template)
    let code = ejs.render(template, { entryId: this.entryId, modules: this.modules })
    this.assets = {}

    // 最终把代码写到输出文件里
    this.assets[main] = code
    fs.writeFileSync(main, this.assets[main])

    console.log('code --------------->> ', code)
  }
}

module.exports = Compiler