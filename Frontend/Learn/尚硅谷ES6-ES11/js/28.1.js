//引入 fs 模块
const fs = require('fs')

//不使用无限回调的方式实现我们采用promise方式实现
const P = new Promise((resolve, reject) => {
  fs.readFile('./resources/为学.md', (err, data) => {
    //成功获取第一个文件的内容,不设置失败选项
    resolve(data)
  })
})

// value是拿到了第一个文件内容
P.then(value => {
  // 只能拿到第二个文件内容第三个还得回调,但是可以通过retur获取第三个
  return new Promise((resolve, reject) => {
    // data拿到了第二个文件内容
    fs.readFile('./resources/风雨.md', (err, data) => {
      // 输出一个成功,把第一个值和第二个值拼接成一个数组
      resolve([value, data])
    })
  })
}).then(value => {
  // 这里的then读取的事上一条语句里面的return
  return new Promise((resolve, reject) => {
    fs.readFile('./resources/山有扶苏.md', (err, data) => {
      // 压入,将第三个数据添加进数组结尾
      value.push(data)
      // 输出最终结果
      resolve(value)
    })
  })
  // 数据全部获取完以后最后一个then方法用于输出
}).then(value => {
  // 原生数组join方法转换成字符串进行拼接
  console.log(value.join('\r\n'))
})

// 在确保有node的情况下,运行此文件,node 28.1.js