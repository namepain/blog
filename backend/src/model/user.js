module.exports = class extends think.Model {
  get schema() {
    return {
      name: {
        required: true
      },
      password: {
        default: '888888'
      },
      createdAt: {
        type: 'datetime',
        default: () => think.datetime()
      }
    }
  }
};
