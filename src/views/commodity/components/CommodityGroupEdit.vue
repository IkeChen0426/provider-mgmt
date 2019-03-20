<template lang="html">
  <el-dialog custom-class="commodity-group-edit" title="店内分组" :visible.sync="dialogVisible" width="500px">
    <el-form ref="form" :model="model" :rules="rules" label-width="100px">
      <el-form-item label="分组名称" prop="displayName">
        <el-input class="form-input" v-model="model.displayName"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createSpaceTag, updateSpaceTag, getSpaceTag } from '@/api/spaceTags'
import { mapGetters } from 'vuex'

class Tag {
  enable = true
  displayName = null
}

export default {
  name: 'CommodityGroupEdit',
  props: ['visible', 'groupId'],
  data () {
    return {
      model: new Tag(),
      rules: {
        displayName: [{ required: true, trigger: 'change', message: '分组名称不能位空' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'commodityGroupSpaceId'
    ]),
    dialogVisible: {
      get () {
        return this.visible
      },
      set (newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  watch: {
    async visible (newValue) {
      if (newValue) {
        this.groupId && await this.getCommodityGroup()
      } else {
        this.model = new Tag()
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    }
  },
  methods: {
    getCommodityGroup () {
      return getSpaceTag({ spaceId: this.commodityGroupSpaceId, tagId: this.groupId }).then(res => {
        this.model = res.data
      })
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.groupId ? this.updateCommodityGroup() : this.createCommodityGroup()
        } else {
          this.$message.warning('请正确填写信息')
        }
      })
    },
    createCommodityGroup () {
      createSpaceTag({ spaceId: this.commodityGroupSpaceId, data: this.model }).then(res => {
        this.$message.success('添加成功')
        this.dialogVisible = false
        this.$emit('done')
      })
    },
    updateCommodityGroup () {
      updateSpaceTag({ spaceId: this.commodityGroupSpaceId, tagId: this.groupId, data: this.model }).then(res => {
        this.$message.success('更新成功')
        this.dialogVisible = false
        this.$emit('done')
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.commodity-group-edit {
  .form-input {
    max-width: 300px;
  }
}
</style>
