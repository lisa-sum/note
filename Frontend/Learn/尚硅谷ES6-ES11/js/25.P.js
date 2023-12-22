//1.引入fs 模块
const fs = require('fs')

//2. 调用方法读取文件
// fs.readFile('./resources/为学.md',(err,data)=>{
//         //err如果出错是错误对象,如果失败是null   date是结果

//         //如果失败则抛出错误
//         if(err) throw err;
//         //data来自形参
//         console.log(data.toString());
// });

//第三种办法虽然更繁琐,但是不存在回调地狱,代码量大方便后期的维护
//3. 使用Promise 异步任务封装
const p = new Promise(function (resolve, reject) {
  //err如果出错是错误对象,如果失败是null   date是结果
  fs.readFile('./resources/为学.mda', (err, data) => {
    //判断如果失败 通过reject可以改变p的状态为失败
    //并且还可以失败的值是错误对象
    if (err) reject(err)

    //如果成功
    resolve(data)
  })
})

//形参名字不强制但是,业内规则是这么写
p.then(function (value) {
  console.log(value.toString())
}, function (reason) {
  console.log('读取失败')
})