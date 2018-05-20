module.exports = class extends think.Model {
  get schema() {
    return {
      createdAt: {
        type: 'datetime',
        default: () => think.datetime()
      }
    }
  }
};
