module.exports = class extends think.Logic {
  indexAction() {

  }

  delAction() {
    this.allowMethods = 'DELETE'
    this.rules = {
      id: {
        required: true
      }
    }
  }
};
