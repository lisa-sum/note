(function () {
  function r (e, n, t) {
    function o (i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require
          if (!f && c) return c(i, !0)
          if (u) return u(i, !0)
          var a = new Error('Cannot find module \'' + i + '\'')
          throw a.code = 'MODULE_NOT_FOUND', a
        }
        var p = n[i] = { exports: {} }
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r]
          return o(n || r)
        }, p, p.exports, r, e, n, t)
      }
      return n[i].exports
    }

    for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++) o(t[i])
    return o
  }

  return r
})()({
  1: [
    function (require, module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true,
      })
      exports.fn2 = fn2
      var name = '123'
      var age = '123'
      var height = '123'

      function fn1 () {
        console.log(123)
      }

      exports.default = { name: name, age: age, height: height, fn1: fn1 }
      var gender = exports.gender = '男'

      function fn2 () {
        console.log('函数二')
      }
    }, {}], 2: [
    function (require, module, exports) {
      'use strict'

      var _ = require('./42.1.js')

      var _2 = _interopRequireDefault(_)

      function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj } }

      console.log(_2.default)

      console.log(_.gender, _.fn2)
    }, { './42.1.js': 1 }],
}, {}, [2])