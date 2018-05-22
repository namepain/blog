import Axios from 'axios'

// import axios from 'axios'
const data = require('./data.json')

const prefix = 'http://localhost:8360'

export const api = {
  fetch: (model, query) => {
    // const target = `/${model}`

    // return axios.get(target, {
    //   params: query
    // }).then((response) => {
    //   return response.data
    // })

    return new Promise((resolve) => {
      setTimeout(() => {
        if (query && query.page) {
          console.log('第二页--------------->' + query.page)
          console.log('data--------------->' + data[model].length)
          resolve(data[model].slice((query.page - 1) * 10, query.page * 10))
        } else {
          resolve(data[model])
        }
      }, 20)
    })
  }
}

export function getPost(query = {}) {
  return Axios.get(`${prefix}/post/getByPage`, {
    params: query
  }).then(res => {
    return res.data.data
  })
}

export function getBlog(query) {
  return Axios.get(`${prefix}/post/getBlog`, {
    params: query
  }).then(res => {
    return res.data.data
  })
}
