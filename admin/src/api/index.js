import axios from 'axios'

export const IMG_PATH = '/proxyPrefix/' // 'http://localhost:8360/'

export const ERR_OK = 0

export function signIn(form) {
  return axios.post('proxyPrefix/login', form)
}

export function signOut() {
  return axios.post('proxyPrefix/login/signOut')
}

// 几个动态查询
export function createGet(target, query = {}) {
  return axios.get(`proxyPrefix/${target}/get`, {
    params: query
  })
}

// thinkjs 服务器对 delete 使用 .post() 获取参数，
// 所以 delete 方法传参得使用 'data' 而不是 'params'
export function createDelete(target, query = {}) {
  return axios.delete(`proxyPrefix/${target}/del`, {
    data: query
  })
}

export function createPost(target, param = {}) {
  return axios.post(`proxyPrefix/${target}/post`, param)
}

export function createPatch(target, param = {}) {
  return axios.patch(`proxyPrefix/${target}/patch`, param)
}
