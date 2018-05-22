// import axios from 'axios'
const data = require('./data.json')

export default {
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
