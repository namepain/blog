module.exports = class extends think.Controller {
  async __before() {
    if (this.ctx.controller === 'login' || this.ctx.action === 'index') {
      return;
    }
    const userInfo = await this.session('userInfo');

    // 获取用户的 session 信息，如果为空 且 不是 get 请求
    // 返回 false 阻止后续的行为继续执行
    if (think.isEmpty(userInfo) && !this.isGet) {
      this.fail('请登录后再操作！！')
      return false;
    }

    this.header('Access-Control-Allow-Origin', '*')
  }
};
