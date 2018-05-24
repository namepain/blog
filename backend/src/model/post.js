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

  async getPostIdBytagName(tagName) {
    const list = await this.query(`
      select a.post_id from think_post_tag a join think_tag b on a.tag_id=b.id
      where b.name='${tagName}'
    `)
    return list
  }
};
