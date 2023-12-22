// 1.引入fs文件模块
const fs = require('fs')

// 创建三个函数返回一个异步Promise,读取文件,只有在文件路径错误的时候才会报错
function readWeiXue () {
  return new Promise((resolve, reject) => {
    fs.readFile('./resources/为学.md', (err, data) => {
      // 如果失败,报错并且结束函数
      if (err) reject(err)
      resolve(data)
    })
  })
}

function readFuSu () {
  return new Promise((resolve, reject) => {
    fs.readFile('./resources/山有扶苏.md', (err, data) => {
      // 如果失败,报错并且结束函数
      if (err) reject(err)
      resolve(data)
    })
  })
}

function readFengYu () {
  return new Promise((resolve, reject) => {
    fs.readFile('./resources/风雨.md', (err, data) => {
      // 如果失败,报错并且结束函数
      if (err) reject(err)
      resolve(data)
    })
  })
}

// 声明一个async函数来运行上面的三个Promise
async function main () {
  let weixue = await readWeiXue()
  let fusu = await readFuSu()
  let fengyu = await readFengYu()

  // 输出结果
  console.log(weixue.toString())
  console.log(fusu.toString())
  console.log(fengyu.toString())
}

main()

// 使用powershell来运行此js文件