export const post = {
  model: 'post',
  items: [
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
    }
  ]
}

export const cate = {
  model: 'cate',
  items: [
    {
      prop: 'name',
      label: '分类名',
      description: '这是一个分类的名字',
      default: 'default'
    },
    {
      prop: 'desc',
      label: '描述'
    }
  ]
}

export const tag = {
  model: 'tag',
  items: [
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
