module.exports = class extends think.Logic {
  indexAction() {

  }

  addAction() {
    this.rules = {
      name: {
        required: true
      }
    }
  }

  delAction() {
    this.rules = {
      id: {
        required: true
      }
    }
  }
}
