const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  // find cate by id
  async findByIdAction() {
    const id = this.get('id')
    const result = await this.model('cate').where({
      id: id
    }).find()
    return this.success(result)
  }

  // post cate
  async postAction() {
    const cate = this.post()
    const result = await this.model('cate').add(cate)
    this.get('id', result)
    return this.findByIdAction()
  }
  // get by query
  async getAction() {
    const query = this.get()
    const result = await this.model('cate').where(query).select()
    return this.success(result)
  }

  // del cate
  async delAction() {
    const id = this.post('id')
    const result = await this.model('cate').where({
      id: id
    }).delete()
    return this.success(result)
  }

  // patch cate
  async patchAction() {
    const post = this.post()
    const result = await this.model('cate').where({
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

    // 更新完了把更新后的对象发回去
    this.get('id', post.id)
    return this.findByIdAction()
  }
};
