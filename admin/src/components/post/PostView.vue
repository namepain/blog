<template>
  <el-form ref="form" v-loading.body="isLoading" :model="form" label-width="80px" class="form">
    <el-row :gutter="0">
      <el-col :span="18">
        <el-form-item v-for="(item, index) in options.leftItems" :key="index" :label="item.label">
          <el-input v-if="item.type === 'input'" :placeholder="item.desc || ''" v-model="form[item.prop]"></el-input>
          <el-radio v-if="item.type === 'radio'" v-model="form[item.prop]" :label="item.label"></el-radio>

          <markdown v-if="item.type === 'markdown'" v-model="form[item.prop]" class="markarea" ref="markdown"
          ></markdown>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item v-for="(item, index) in options.rightItems" :key="index" :label="item.label">
          <el-input v-if="item.type === 'input'" :placeholder="item.desc || ''" v-model="form[item.prop]"></el-input>
          <el-radio v-if="item.type === 'radio'" v-model="form[item.prop]" :label="item.label"></el-radio>
          <el-select v-if="item.type === 'tags'" v-model="form[item.prop]" multiple>
            <el-option v-for="(tag, index) in tags" :key="index" :label="tag.text" :value="tag.value">
            </el-option>
          </el-select>
          <el-select v-if="item.type === 'cate'" v-model="form[item.prop]">
            <el-option v-for="(cate, index) in cates" :key="index" :label="cate.text" :value="cate.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="20px" class="buttons">
          <el-button type="primary" @click.native="onSave" v-if="hasTemSave">暂存文章 </el-button>
          <el-button type="success" @click.native="onSubmit">提交文章 </el-button>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Markdown from 'components/templates/Markdown'
import { marked } from 'common/js/marked'
import { saveLocalData, loadLocalData, removeLocalData } from 'common/js/util'

const options = {
  leftItems: [
    {
      type: 'input',
      prop: 'title',
      label: '标题',
      desc: '这里是文章的标题'
    },
    {
      type: 'input',
      prop: 'pathName',
      label: '路径',
      desc: '这里是文章的路径'
    },
    {
      type: 'markdown',
      prop: 'mdContent',
      label: '内容'
    }
  ],
  rightItems: [
    {
      type: 'tags',
      prop: 'tag',
      label: '标签'
    },
    {
      type: 'cate',
      prop: 'cate_id',
      label: '分类'
    }
  ]
}

export default {
  data() {
    let fn = (prev, curr) => {
      prev[curr.prop] = curr.default || ''
      return prev
    }
    let form = this.options.leftItems.reduce(fn, {})
    form = this.options.rightItems.reduce(fn, form)

    let hasTemSave = !this.$route.params.id
    return {
      hasTemSave: hasTemSave,
      isLoading: true,
      form: form,
      tags: [],
      cates: []
    }
  },
  created() {
    this.options = options

    if (this.$route.params.id) {
      this.getModel({ model: 'post', query: { id: this.$route.params.id } }).then(res => {
        if (res instanceof Error) {
          this.$message.error('获取文章失败！！')
          return false
        }
        this._loadFromModel()
      })
    } else {
      this._loadDraft()
    }
    this._loadTagsCate()
  },
  computed: {
    ...mapGetters([
      'model'
    ])
  },
  methods: {
    onSave() {
      console.dir(this.form)
      saveLocalData('_draft', '__blog__', this.form)
      this.$message({
        type: 'success',
        message: '草稿保存成功~'
      })
    },
    onSubmit(value, render) {
      console.log(value, render)
      let id = this.form.id
      this.form.summary = marked(this.form.mdContent.split('<!--more-->')[0])
      this[id ? 'patchModel' : 'postModel']({ model: 'post',
        param: Object.assign({}, this.form, {
          content: this.$refs.markdown[0].compiledMarkdown, // 编译后的文本，markdown 组件在 for 循环里 所以是数据
          mdContent: JSON.stringify(this.form.mdContent) // 处理 textarea 里折行特殊字符，先 stringify 变成字符串
        })
      }).then(res => {
        if (res instanceof Error) {
          this.$message.error('文章提交失败！！')
          return false
        }
        console.log(this.model)
        removeLocalData('_draft', '__blog__')
        this._loadFromModel()
        this.$message({
          type: 'success',
          message: '文章提交成功！'
        })
      })
    },
    _loadFromModel() {
      let obj = this.model
      this.form = Object.assign({}, obj, {
        mdContent: JSON.parse(obj.mdContent),
        tag: obj.tag.map(t => t.id)
      })
      if (obj.id && !this.$route.params.id) {
        this.$router.replace({ path: `/post/create/${obj.id}` })
      }
    },
    _loadDraft() {
      let _draft = loadLocalData('_draft', '__blog__', false)
      if (_draft && !_draft.id) {
        this.$confirm('检测到草稿，是否加载？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false
        }).then(() => {
          this.form = _draft
          this.$message({
            type: 'success',
            message: '已加载草稿'
          })
        })
      }
    },
    _loadTagsCate() {
      let getTags = this.get({ model: 'tag' })
      let getCate = this.get({ model: 'cate' })
      Promise.all([getTags, getCate]).then(([tagsRes, catesRes]) => {
        this.tags = tagsRes.data.data.map((el) => { return { text: el.name, value: el.id } })
        this.cates = catesRes.data.data.map((el) => { return { text: el.name, value: el.id } })
        this.isLoading = false
      }).catch(e => {
        this.isLoading = false
        this.$message.error('网络请求出错！！')
      })
    },
    ...mapActions({
      'get': 'GET',
      'getModel': 'GET_MODEL',
      'postModel': 'POST_MODEL',
      'patchModel': 'PATCH_MODEL'
    })
  },
  watch: {
    '$route' (to, from) {
      // console.log(to, from)
    }
  },
  components: {
    Markdown
  }
}
</script>

<style lang="stylus" scoped>
.form
  padding 10px 15px 0 0
  .markarea
    min-height 400px
  .buttons
    padding-left 30px
</style>
