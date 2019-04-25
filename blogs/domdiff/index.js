import { createElement, render } from './vnode.mjs'
import diff from './diff.mjs'
import patch from './patch.mjs'


let vdom = createElement('ul', { class: 'list' }, [
  createElement('li', { class: 'list-item', style: 'color: red', key: 'key1' }, ['1']),
  createElement('li', { class: 'list-item', key: 'key2' }, ['2']),
  createElement('li', { class: 'list-item', key: 'key3' }, ['3']),
])

// 将 vdom 首次渲染到页面
// console.log(vdom)
let dom = render(vdom)
console.log(dom)
document.body.appendChild(dom)

let vdom1 = createElement('ul', { class: 'list' }, [
  createElement('li', { class: 'list-item' }, ['1']),
  createElement('li', { class: 'list-item', key: 'key3' }, ['333']),
  createElement('li', { class: 'list-item111', style: 'color: blue' }, ['2b']),
  createElement('div', { class: 'list-item1' }, ['3a']),
  createElement('div', { class: 'list-item444' }, ['4d']),
  createElement('li', { class: 'list-item555' }, ['5E']),
])

// diff 除补丁包
let patches = diff(vdom, vdom1)
console.log(patches)

// 给视图打补丁
setTimeout(() => {
  patch(dom, patches)
}, 1000)
