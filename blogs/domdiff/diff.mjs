/******************** diff ********************/
const ATTRS = 'ATTRS'
const TEXT = 'TEXT'
const REMOVE = 'REMOVE'
const REPLACE = 'REPLACE'
const INSERT = 'INSERT'
const MOVE = 'MOVE'

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
    
  } else {
    currentPatch.push({ type: REPLACE, newNode })
  }

  // 当前有补丁
  if (currentPatch.length) {
    patches[i] = currentPatch
  }
}

function diffProps(oldProps, newProps) {
  let patch = {}

  // 记录有修改的
  for(let prop in oldProps) {
    if (oldProps[prop] !== newProps[prop]) {
      patch[prop] = newProps[prop]
    }
  }
  // 记录有新增的
  for (let prop in newProps){
    if (!oldProps.hasOwnProperty(prop)) {
      patch[prop] = newProps[prop]
    }
  }
  return patch
}

function diffChildren(oldNodes, newNodes, i, patches, currentPatch) {
  let oldStartIndex = 0
  let newStartIndex = 0
  let key2Index = oldNodes.reduce((prev, curr, idx) => {
    if (curr.key) {
      prev[curr.key] = idx
      return prev
    }
  }, {})

  while(oldStartIndex < oldNodes.length) {
    let old = oldNodes[oldStartIndex]
    let n = newNodes[newStartIndex]

    if (n && n.key && key2Index[n.key]) {         // 说明已经存在相同 key
      let oldKeyIdx = key2Index[n.key]
      let [oldNode] = oldNodes.splice(oldKeyIdx, 1)
      oldNode.moveFlag = oldKeyIdx
      oldNodes.splice(oldStartIndex, 0, oldNode)
      old = oldNodes[oldStartIndex]
      console.log(oldNodes)
    }
    diffVnode(old, n, ++index, patches)

    oldStartIndex++
    newStartIndex++
  }

  // 有多余的算新增
  if (newNodes.length > newStartIndex) {
    currentPatch.push({ type: INSERT, newChildren: newNodes.slice(newStartIndex) })
  }
}

function isString(str) {
  return Object.prototype.toString.call(str) === '[object String]'
}

export default diff