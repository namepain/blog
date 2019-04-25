/****************** vnode *****************/
export class Vnode {
  constructor(type, props, children) {
    this.type = type
    this.props = props
    this.children = children

    this.key = props.key
  }
}

// 设置属性
export function setAttr(node, prop, value) {
  switch (prop) {
    case 'value':
      if (node.tagName.toUpperCase() === 'INPUT' ||
        node.tagName.toUpperCase() === 'TEXTAREA') {
        node.value = value
      } else {
        node.setAttribute(prop, value)
      }
      break;

    case 'style':
      node.style.cssText = value
      break;

    default:
      node.setAttribute(prop, value)
      break
  }
}

// 创建 vnode 工厂函数
export function createElement(...args) {
  return new Vnode(...args)
}

// 渲染 vdom 至真实 dom 的渲染函数
export function render(vdom) {
  let el = document.createElement(vdom.type)
  Object.keys(vdom.props).forEach(prop => {
    setAttr(el, prop, vdom.props[prop])
  })
  vdom.children.forEach(child => {
    child = child instanceof Vnode ? render(child) : document.createTextNode(child)
    el.appendChild(child)
  })
  return el
}

// export { createElement, render }