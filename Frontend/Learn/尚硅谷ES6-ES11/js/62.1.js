// import * as m1 from './62.2';

// ES11 动态引入,等到用的时候再导入
const btn = document.querySelector('.btn')
btn.onclick = function () {
  import('./62.2.js').then(module => {
    module.hello()
  })
}