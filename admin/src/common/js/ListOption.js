export default {
  'post': {
    model: 'post',
    labels: [
      {
        prop: 'title',
        label: '标题'
      },
      {
        prop: 'pathName',
        label: '路径'
      },
      {
        prop: 'tag',
        label: '标签'
      },
      {
        prop: 'createdAt',
        label: '创建日期'
      }
    ]
  },
  'cate': {
    model: 'cate',
    labels: [
      {
        prop: 'createdAt',
        label: '创建日期'
      },
      {
        prop: 'name',
        label: '分类名'
      },
      {
        prop: 'desc',
        label: '描述'
      }
    ]
  },
  'tag': {
    model: 'tag',
    labels: [
      {
        prop: 'createdAt',
        label: '创建日期'
      },
      {
        prop: 'name',
        label: '标签名'
      },
      {
        prop: 'desc',
        label: '描述'
      }
    ]
  }
}
