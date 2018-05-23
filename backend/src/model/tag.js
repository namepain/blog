module.exports = class extends think.Model {
  get schema() {
    return {
      createdAt: {
        type: 'datetime',
        default: () => think.datetime()
      }
    }
  }

  getTagsCount() {
    return this.query(`SELECT tag.name name,count(1) num 
      FROM think_tag tag join think_post_tag t 
      on t.tag_id = tag.id GROUP BY tag.id;`)
  }
};
