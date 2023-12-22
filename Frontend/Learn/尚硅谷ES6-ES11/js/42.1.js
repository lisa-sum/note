//在需要暴露的数据前面 添加export即可向外部输出功能模块
// 第一种写法,import后随意命名,不能as重命名不能使用大括号
var name = '123'
var age = '123'
var height = '123'

function fn1 () {
  console.log(123)
}

export default { name, age, height, fn1 }

// 第二种写法,import后面名称和这个一样,要使用大括号,可以as重命名
export var gender = '男'

export function fn2 () {
  console.log('函数二')
}

// 第三种写法,import * as a4 from './js/42.1.js';以这种方式来引用,a4.findJob这样调用
let school = '尚硅谷'

function findJob () {
  console.log('找工作')
}

export { school, findJob }