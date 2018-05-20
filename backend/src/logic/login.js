module.exports = class extends think.Logic {
  indexAction() {
    this.allowMethods = 'post'
    this.rules = {
      name: {
        required: true
      },
      password: {
        required: true
      }
    }
  }
};
