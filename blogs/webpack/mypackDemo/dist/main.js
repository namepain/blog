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
  return __webpack_require__("./src/index.js");
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