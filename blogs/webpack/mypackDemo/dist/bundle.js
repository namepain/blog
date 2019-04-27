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
  return __webpack_require__("./src\index.js");
})
  ({
    
    "./src\index.js":
      (function (module, exports, __webpack_require__) {
        eval(`__webpack_require__("./src\\a.js");

__webpack_require__("./src\\index.less");`);
      }),
    
    "./src\a.js":
      (function (module, exports, __webpack_require__) {
        eval(`__webpack_require__("./src\\b.js");

console.log(1);`);
      }),
    
    "./src\b.js":
      (function (module, exports, __webpack_require__) {
        eval(`console.log('b');`);
      }),
    
    "./src\index.less":
      (function (module, exports, __webpack_require__) {
        eval(`let style = document.createElement('style');
style.innerHTML = "html body {\\n  background: red;\\n}\\n";
document.head.appendChild(style);`);
      }),
    
  });