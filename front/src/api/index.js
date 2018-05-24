import Axios from 'axios'

const prefix = '/proxyPrefix'

export function getPost(query = {}) {
  return Axios.get(`${prefix}/post/getByPage`, {
    params: query
  }).then(res => {
    return res.data.data
  })
}

export function getBlog(query = {}) {
  return Axios.get(`${prefix}/post/getBlog`, {
    params: query
  }).then(res => {
    return res.data.data
  })
}

export function getArchives() {
  return Axios.get(`${prefix}/post/getArchives`).then(res => {
    return res.data.data
  })
}

export function getTags() {
  return Axios.get(`${prefix}/tag/getTags`).then(res => {
    let arr = res.data.data
    return arr.reduce((prev, curr) => {
      prev[curr.name] = curr.num
      return prev
    }, {})
  })
}

export function getBytag(query) {
  return Axios.get(`${prefix}/post/getBytag`, {
    params: query
  }).then(res => {
    return res.data.data
  })
}
