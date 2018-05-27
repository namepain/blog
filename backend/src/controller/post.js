const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  // find by id
  async findByIdAction() {
    const id = this.get('id')
    const result = await this.model('post')
      .where({
        id: id
      }).find()
    return this.success(result)
  }

  // post post
  async postAction() {
    const post = this.post()
    const result = await this.model('post').add(post)
    this.get('id', result)
    return this.findByIdAction()
  }

  // del post
  async delAction() {
    const id = this.post('id')
    const result = await this.model('post').where({
      id: id
    }).delete()
    return this.success(result)
  }

  // get by query
  async getAction() {
    const query = this.get()
    const result = await this.model('post').where(query).select()
    return this.success(result)
  }

  // get by page
  async getByPageAction() {
    const param = this.get()
    const result = await this.model('post')
      .page(param.page || 1, param.limit || 10)
      .order('createdAt desc')
      .select()
    return this.success(result)
  }

  // get blog (prev, next)
  async getBlogAction() {
    const pathName = this.get('pathName')
    const blog = await this.model('post').where({
      pathName: pathName
    }).select()
    if (!blog || !blog.length) {
      return this.fail('路径错误, 找不到文章！！')
    }
    const prev = await this.model('post').where(
      `createdAt >= '${blog[0].createdAt}' and id != ${blog[0].id}`
    ).order('createdAt asc').limit(1).getField('title, pathName', true)
    const next = await this.model('post').where(
      `createdAt <= '${blog[0].createdAt}' and id != ${blog[0].id}`
    ).order('createdAt desc').limit(1).getField('title, pathName', true)
    return this.success({
      blog: blog[0],
      prev: prev,
      next: next
    })
  }

  // get Archives
  async getArchivesAction() {
    const list = await this.model('post').getArchives()
    let obj = {}
    list.forEach((item) => {
      let key = think.datetime(new Date(item.createdAt), 'YYYY年MM月')
      if (!obj[key]) {
        obj[key] = []
      }
      obj[key].push(item)
    })
    return this.success(obj)
  }

  // get By Tag
  async getBytagAction() {
    const tagName = this.get('tagName')
    const postIdArr = await this.model('post').getPostIdBytagName(tagName)
    const postIds = postIdArr.reduce((prev, curr) => {
      prev.push(curr.post_id)
      return prev
    }, [])
    const result = await this.model('post')
      .where({id: ['in', postIds]})
      .select({field: 'title, summary, createdAt, pathName'})
    return this.success(result)
  }

  // patch post
  async patchAction() {
    const post = this.post()
    const result = await this.model('post').where({
      id: post.id
    }).update(post).catch(err => {
      return think.isError(err) ? err : new Error(err)
    });
    // 这里判断如果返回值是转换后的错误对象，然后对其处理。
    // 接口正常情况下不会返回 Error 对象
    if (think.isError(result)) {
      // 这里将错误信息返回，或者返回格式化后的错误信息也都可以
      return this.fail(1000, result.message);
    }

    // 更新完了把更新后的文章发回去
    this.get('id', post.id)
    return this.findByIdAction()
  }
};
