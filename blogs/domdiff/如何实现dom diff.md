# 实现一下 dom diff 的主要思路
虚拟 dom 的本质就是在程序内存中 **描述 dom 结构的对象**

那么在内存中使用对象描述 `dom` 结构有什么好处呢？就笔者所知，好处有二。其一，通过在内存中使用算法对比 `dom` 的结构，找出 `dom` 的最小变更，从而在更新视图的时候节省性能开销；其二，虚拟 `dom` 允许我们脱离目标平台描述视图，从而更容易实现跨平台应用。

本文主要探索如何实现一个基本的 `dom diff`

## 从创建 vnode 开始
在 `react/vue` 框架中我们使用 `createElement` 方法创建 `vnode`, 此方法一般接受三个参数: `type, props, children`

```
let vdom = createElement('ul', { class: 'list' }, [
  createElement('li', { class: 'list-item' }, '1'),
  createElement('li', { class: 'list-item' }, '2'),
  createElement('li', { class: 'list-item' }, '3'),
])
```

于是我们需要构建一个 `createElement` 方法帮我们创建 `vnode`

```
export class Vnode {
  constructor(type, props, children) {
    this.type = type
    this.props = props
    this.children = children

    this.key = props.key
  }
}

export function createElement(...args) {
  return new Vnode(...args)
}
```

同时我们需要一个渲染方法把 `vnode` 渲染到页面上
```
export function render(vdom) {
  let el = document.createElement(vdom.type)      // 根据根节点创建一个 dom 元素
  Object.keys(vdom.props).forEach(prop => {       // 给元素设置 props
    setAttr(el, prop, vdom.props[prop])
  })
  vdom.children.forEach(child => {                // 深度遍历子节点创建完整 dom 树
    child = child instanceof Vnode ? render(child) : document.createTextNode(child)
    el.appendChild(child)
  })
  return el
}
```

## diff 两次创建的 vnode

我们期望根据 `dom diff` 的结果给现有 `dom` 元素打补丁，以较小的代价去更新页面元素，而不是暴力删除当前 `dom` 元素并整个重新创建。

对比两次创建的 `vnode` , 首先枚举出新旧节点对比过程可能有哪些发生变化的情况

- 都是文本节点，直接替换文本 
- 同类型节点
  - 属性有改变
  - 子节点有改变，对比子节点
- 不同类型节点，直接替换成新节点
- 旧节点没有对应的新节点，删除操作
- 新节点没有对应的旧节点，新增操作
- 新节点有对应的旧节点，但索引不一样，同层级移动操作

```
// 定义可能的操作
const ATTRS = 'ATTRS'
const TEXT = 'TEXT'
const REMOVE = 'REMOVE'
const REPLACE = 'REPLACE'
const INSERT = 'INSERT'
const MOVE = 'MOVE'

// 记录索引，使用遍历时的索引把 vnode 节点跟 patch 补丁包对应起来
let index = 0

function diff (oldVnode, newVnode) {
  let patches = {}  // 最终的 补丁包
  diffVnode(oldVnode, newVnode, index, patches)
  return patches
}

function diffVnode(oldNode, newNode, i, patches) {
  let currentPatch = []

  // 如果没有 newNode 就是 remove 了
  if (!newNode) {
    currentPatch.push({ type: REMOVE, index: i })

    // 如果是 text 就直接对比
  } else if (isString(oldNode) && isString(newNode)) {
    if (oldNode !== newNode) {
      currentPatch.push({ type: TEXT, text: newNode })
    }
  // 如果元素类型相同 则对比属性
  } else if (oldNode.type === newNode.type) {

    // 说明复用了节点，是移动操作
    if (oldNode.moveFlag !== undefined) {
      currentPatch.unshift({ type: MOVE, moveFrom: oldNode.moveFlag })
    }

    let attrs = diffProps(oldNode.props, newNode.props)
    
    // 属性有更改
    if (Object.keys(attrs).length) {
      currentPatch.push({ type: ATTRS, attrs })
    }

    // 比较 children
    diffChildren(oldNode.children, newNode.children, i, patches, currentPatch)
  
  // 否则就是 替换操作了
  } else {
    currentPatch.push({ type: REPLACE, newNode })
  }

  // 当前有补丁，记录到补丁包里
  if (currentPatch.length) {
    patches[i] = currentPatch
  }
}

function diffChildren(oldNodes, newNodes, i, patches, currentPatch) {
  let oldStartIndex = 0
  let newStartIndex = 0

  // 创建一个元素 key:index 的映射对象，
  // 如新旧 vnode 有相同 key, 且类型相同
  // 则是 复用了节点，做 MOVE 操作
  let key2Index = oldNodes.reduce((prev, curr, idx) => {
    if (curr.key) {
      prev[curr.key] = idx
      return prev
    }
  }, {})

  // 根据旧的节点列表循环
  while(oldStartIndex < oldNodes.length) {
    let old = oldNodes[oldStartIndex]
    let n = newNodes[newStartIndex]

    // 如果发现了 就节点中有同 key 的 vnode 旧打上 moveFlag
    if (n && n.key && key2Index[n.key]) {         // 说明已经存在相同 key
      let oldKeyIdx = key2Index[n.key]
      let [oldNode] = oldNodes.splice(oldKeyIdx, 1)
      oldNode.moveFlag = oldKeyIdx
      oldNodes.splice(oldStartIndex, 0, oldNode)
      old = oldNodes[oldStartIndex]
      console.log(oldNodes)
    }

    // 递归 diffVnode
    diffVnode(old, n, ++index, patches)

    oldStartIndex++
    newStartIndex++
  }

  // 循环完成之后，还有多余的 vnode 都算新增
  if (newNodes.length > newStartIndex) {
    currentPatch.push({ type: INSERT, newChildren: newNodes.slice(newStartIndex) })
  }
}
```

## 给现有 vnode 打补丁

要给每一个`dom`节点打补丁，需要使用深度优先的方式访问每一个节点，可以根据访问时的索引 来记录节点跟他的 `patch` 补丁的对应关系。

```
let allPatches                          // 记录当前 dom 结构及其下 所有补丁
let index = 0

function patch(el, patches) {
  allPatches = patches
  patchVnode(el)
}

function patchVnode(node, i, arr) {
  let currentPatch = allPatches[index++]
  let patchedNode, moveFrom

  if (currentPatch) {
    [patchedNode, moveFrom] = doPatch(node, currentPatch) // 如果是移动操作，node可能会变化
    if (patchedNode !== node) {                           // 移动操作时，真实 dom 已经被 insertBefore 了
      arr.splice(i, 0, ...arr.splice(moveFrom, 1))        // , 还需要将 vnode 扣到对应的位置
    }                                                     // 从而保持索引不乱
  }

  // 如果当前 没有补丁 或 补丁中有删除操作，则不需要 patch children, 保持 index 正确对应
  if (!currentPatch || !currentPatch.some(v => v.type === 'REMOVE')) {
    // 注意：node.childNodes 引用是动态的，如果不浅拷贝，删除了一项，则后面的索引会乱掉
    let childNodes = [...(patchedNode || node).childNodes]
    childNodes.forEach((child, i, arr) => {
      patchVnode(child, i, arr)
    })
  }
}

function doPatch(node, patches) {
  let moveFrom
  patches.forEach(patch => {
    switch (patch.type) {
      case 'ATTRS':
        for(let key in patch.attrs) {
          let value = patch.attrs[key]
          if (value) {
            setAttr(node, key, value)
          } else {                                      // 有可能是移除属性
            node.removeAttribute(key)
          }
        }
        break;
      case 'MOVE':                                      // 移动操作，找到需要移动的节点
        let currentNode = node.parentNode.children[patch.moveFrom]
        moveFrom = patch.moveFrom
        node.parentNode.insertBefore(currentNode, node)   // 将其插入到当前节点前面
        node = currentNode                                // 由于节点顺序改变了，需要改变一下 node 的引用
        break;                                            // 以面后续 patch 该节点的 children 时索引乱掉
      case 'TEXT':
        node.textContent = patch.text
        break;
      case 'INSERT':
        patch.newChildren
          .map(v => node.appendChild(
            v instanceof Vnode ? render(v) : document.createTextNode(v)
          ))
        break;
      case 'REMOVE':
        node.parentNode.removeChild(node)
        break;
      case 'REPLACE':
        let newNode = patch.newNode instanceof Vnode
          ? render(patch.newNode)
          : document.createTextNode(patch.newNode)
        node.parentNode.replaceChild(newNode, node)
        break;

      default:
        break;
    }
  })
  return [node, moveFrom]
}
```

至此，一个基本的 `dom diff` 功能算是实现了。测试一下

```
// 创建第一个 dom 树
let vdom = createElement('ul', { class: 'list' }, [
  createElement('li', { class: 'list-item', style: 'color: red', key: 'key1' }, ['1']),
  createElement('li', { class: 'list-item', key: 'key2' }, ['2']),
  createElement('li', { class: 'list-item', key: 'key3' }, ['3']),
])

// 将 vdom 首次渲染到页面
let dom = render(vdom)
document.body.appendChild(dom)

// 创建第二个 dom 树，属性，子元素，类型分别都有一些变化
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

```