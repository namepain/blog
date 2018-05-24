export function debounce(fn, delay) {
  let timer
  return function (...arg) {
    timer && clearTimeout(timer)
    setTimeout(() => {
      fn.apply(this, arg)
    }, delay)
  }
}

export function throttle(fn, delay) {
  let time = +new Date()
  return function(...arg) {
    let now = +new Date()
    if (now - time >= delay * 1000) {
      time = now
      fn.apply(this, arg)
    }
  }
}

export function formatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).slice(str.length))
    }
  }
  return fmt
}

export function loadLocalData(key, table, def) {
  if (!localStorage[table]) {
    return def
  }
  let obj = JSON.parse(localStorage[table])[key]
  return obj || def
}

export function saveLocalData(key, table, val) {
  let obj = localStorage[table] && JSON.parse(localStorage[table])
  if (!obj) {
    obj = {}
  }
  obj[key] = val
  localStorage[table] = JSON.stringify(obj)
}

export function removeLocalData(key, table) {
  let obj = localStorage[table] && JSON.parse(localStorage[table])
  if (typeof obj === 'object') {
    delete obj[key]
    localStorage[table] = JSON.stringify(obj)
  }
}
