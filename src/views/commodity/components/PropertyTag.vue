<template>
  <div class="property-tag">
    <span v-if="!isEditing" @click="handleEdit">{{ model }}</span>
    <input ref="input" v-model="value" @blur="handleUpdate" v-else v-focus />
    <i class="el-icon-delete" title="删除" @click="handleDelete"></i>
  </div>
</template>

<script>
export default {
  name: 'PropertyTag',
  props: ['model', 'list'],
  data () {
    return {
      value: '',
      isEditing: false
    }
  },
  methods: {
    handleUpdate () {
      if (!this.value) {
        this.handleDelete()
      } else if (this.value === this.model) {
        this.isEditing = false
      } else if (this.list.indexOf(this.value) !== -1) {
        this.$message.error('已添加了相同的规格值')
        this.handleDelete()
      } else {
        this.$emit('update:model', this.value)
        this.isEditing = false
      }
    },
    handleEdit () {
      this.value = this.model
      this.isEditing = true
    },
    handleDelete () {
      this.$emit('delete')
    }
  },
  directives: {
    focus: {
      inserted (el) {
        el.focus()
      }
    }
  },
  mounted () {
    !this.model && this.handleEdit()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.property-tag {
  display: inline-block;
  font-size: 0;
  line-height: 24px;
  height: 24px;
  vertical-align: middle;
  margin-right: 8px;
  > * {
    vertical-align: middle;
    box-sizing: content-box;
  }
  span, input {
    padding: 0 8px;
    font-size: 12px;
    border: 1px solid #e9eaec;
    display: inline-block;
  }
  span {
    height: inherit;
  }
  input {
    outline: 0;
    line-height: 24px;
    &:focus {
      border-color: #57a3f3;
    }
  }
  i {
    width: 24px;
    display: inline-block;
    line-height: 24px;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    border-width: 1px 1px 1px 0;
    border-style: solid;
    border-color: #e9eaec;
  }
}
</style>
