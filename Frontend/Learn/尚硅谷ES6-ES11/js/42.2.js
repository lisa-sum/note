// 当你采用export var gender = '男'; export function fn2(){}暴露数据时,import后的名称必须和变量名一样,并且需要使用大括号可以随意as重命名
import a1, { fn2 as a3, gender as a2 } from './42.1.js'

console.log(a1)

console.log(a2, a3)

// 还有一种获取数据的json的办法,调用ajax网络接口和本地地址的区别只在于路径而已
async function fetchFn () {
  let res = await fetch('./js/42.arrData.json')
  res = await res.json()
  console.log(res)
}

fetchFn()