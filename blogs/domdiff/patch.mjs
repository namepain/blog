import { Vnode, render, setAttr } from "./vnode.mjs";

/**************** 打补丁 ***************/
let allPatches
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
    if (patchedNode !== node) {
      arr.splice(i, 0, ...arr.splice(moveFrom, 1))
    }
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
    // debugger
    switch (patch.type) {
      case 'ATTRS':
        for(let key in patch.attrs) {
          let value = patch.attrs[key]
          if (value) {
            setAttr(node, key, value)
          } else {    // 有可能是移除
            node.removeAttribute(key)
          }
        }
        break;
      case 'MOVE':
        let currentNode = node.parentNode.children[patch.moveFrom]
        moveFrom = patch.moveFrom
        node.parentNode.insertBefore(currentNode, node)
        node = currentNode
        break;
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

export default patch