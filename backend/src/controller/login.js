const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const name = this.post('name')
    const pass = this.post('password')
    const userInfo = await this.model('user').where({name: name}).find()
    if (!think.isEmpty(userInfo)) {
      if (userInfo.password === pass) {
        await this.session('userInfo', userInfo)
        return this.success()
      } else {
        return this.fail(1002, '密码错误！！')
      }
    }
    return this.fail(1001, '用户名不存在！')
  }

  async signOutAction() {
    const userInfo = await this.session('userInfo')
    console.dir(userInfo)
    await this.session(null);
  }
};
