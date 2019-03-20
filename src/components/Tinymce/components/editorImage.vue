<template>
  <div class="upload-container">
    <el-button icon="el-icon-upload" size="mini" type="primary" @click="dialogVisible = true">上传图片
    </el-button>
    <el-dialog title="上传图片" :visible.sync="dialogVisible">
      <el-upload
        ref="upload"
        class="editor-slide-upload"
        list-type="picture-card"
        action="https://httpbin.org/post"
        :auto-upload="false"
        show-file-list
        multiple>
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EditorSlideUpload',
  data () {
    return {
      dialogVisible: false
    }
  },
  methods: {
    handleSubmit () {
      const upload = this.$refs.upload

      this.$emit('successCBK', upload.uploadFiles)
      upload.clearFiles()
      this.dialogVisible = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>
