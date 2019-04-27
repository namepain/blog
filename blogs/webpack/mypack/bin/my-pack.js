#! /usr/bin/env node

// 1 找到当前执行命令的目录，找到 webpack.config.js
let path = require('path')

let config = require(path.resolve('webpack.config.js'))

let Compiler = require('../lib/Compiler.js')
let compiler = new Compiler(config)

compiler.run()