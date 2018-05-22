const Base = require('./base.js');
const fs = require('fs');
const path = require('path');
// const rename = think.promisify(fs.rename, fs); // 通过 promisify 方法把 rename 方法包装成 Promise 接口

module.exports = class extends Base {
  async indexAction() {
    const file = this.file('file');
    console.log(file)

    // let realName = file.name
    let uuidName = think.uuid()
    let suffix = file.name.slice(file.name.indexOf('.'))
    let downloadPath = 'static/files/' + think.datetime(new Date(), 'YYYY-MM-DD') + '/' + uuidName + suffix
    const filepath = path.join(think.ROOT_PATH, 'www/' + downloadPath);
    think.mkdir(path.dirname(filepath));

    let readStream = fs.createReadStream(file.path)
    let writeStream = fs.createWriteStream(filepath)
    readStream.pipe(writeStream)
    this.success({
      size: file.size,
      name: file.name,
      path: downloadPath,
      type: file.type,
      mtime: file.lastModifiedDate
    })
    console.log('-------------downloadPath--------------->' + downloadPath)
    // await rename(file.path, filepath)
  }
};
