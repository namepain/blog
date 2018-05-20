module.exports = class extends think.Model {
  get schema() {
    return {
      createdAt: {
        type: 'datetime',
        default: () => think.datetime()
      },
      updatedAt: {
        type: 'datetime',
        update: true,
        default: () => think.datetime()
      }
    }
  }

  get relation() {
    return {
      tag: {
        type: think.Model.MANY_TO_MANY,
        rModel: 'post_tag'
      },
      cate: {
        type: think.Model.BELONG_TO
      }
    }
  }

  async getArchives() {
    const list = await this.model('post')
      .select({
        field: 'title, createdAt, pathName',
        group: `DATE_FORMAT(createdAt, '%Y-%m'), id`,
        order: 'createdAt desc'
      })
    return list
  }
};
