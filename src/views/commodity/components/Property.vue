<template>
  <div class="commodity-property">
    <div class="commodity-property-item" v-for="(item, index) of properties" :key="item._id">
      <div class="commodity-property-item-header">
        <el-input
          ref="input"
          class="commodity-property-input"
          v-model="item._name"
          placeholder="请输入规格项目名称"
          clearable
          @blur="handleBlur(item)">
        </el-input>
        <div class="close-btn-wrapper">
          <i class="el-icon-circle-close close-btn" @click="handleDelete(item)"></i>
        </div>
      </div>
      <div class="commodity-property-item-content">
        <property-tag
          v-for="(tag, index) of item.values"
          :key="index"
          :model="tag"
          :list="item.values"
          @update:model="handleUpdateTag(item.values, index, $event)"
          @delete="handleUpdateTag(item.values, index)">
        </property-tag>
        <el-button type="text" icon="el-icon-plus" @click="handleAdd(item)">添加</el-button>
      </div>
    </div>
    <div class="commodity-property-item" v-if="properties.length < 3">
      <div class="commodity-property-item-header">
        <el-button class="commodity-property-input" @click="handleCreate">添加规格项目</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { map } from 'lodash'
import uuidv4 from 'uuid/v4'

export default {
  name: 'Property',
  components: {
    PropertyTag: () => import('./PropertyTag')
  },
  props: ['value'],
  data () {
    return {
      inited: false,
      properties: []
    }
  },
  watch: {
    value (newValue) {
      if (!this.inited) {
        this.init(newValue)
      }
    }
  },
  methods: {
    init (newValue) {
      this.properties = map(newValue, item => ({
        ...item,
        _name: item.name,
        _id: uuidv4()
      }))
      this.inited = true
    },
    update () {
      this.$emit('input', this.properties.filter(({ name, values }) => name && values.length > 0))
    },
    handleCreate () {
      let newItem = {
        _id: uuidv4(),
        name: '',
        _name: '',
        values: []
      }
      let index = this.properties.push(newItem) - 1

      this.$nextTick(() => {
        this.$refs.input[index].focus()
      })
    },
    handleDelete (target) {
      this.properties.splice(this.properties.indexOf(target), 1)
      this.update()
    },
    handleBlur (target) {
      let newName = target._name

      if (!newName) {
        if (target.values.length === 0) {
          this.handleDelete(target)
        } else {
          this.$message.error('规格名不能为空')
        }
      } else if (this.properties.filter(({ _name }) => _name === newName).length >= 2) {
        this.$message.error('规格名不能相同')
        target._name = ''
      } else {
        target.name = newName
        if (this.value.length > 0) {
          this.update()
        }
      }
    },
    handleAdd (item) {
      item.values.push('')
    },
    handleUpdateTag (values, index, item) {
      if (item) {
        values.splice(index, 1, item)
      } else {
        values.splice(index, 1)
      }
      this.update()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/mixin.scss";
.commodity-property {
  padding: 8px;
  border: 1px solid #dddee1;
  .commodity-property-item {
    .commodity-property-item-header {
      padding: 8px;
      font-size: 0;
      background-color: #f8f8f8;
      @include clearfix;
      .commodity-property-input {
        max-width: 200px;
        vertical-align: middle;
      }
      .close-btn-wrapper {
        height: 100%;
        display: none;
        float: right;
        .close-btn {
          vertical-align: middle;
          font-size: 20px;
          color: #C0C4CC;
          cursor: pointer;
        }
      }
    }
    .commodity-property-item-content {
      padding: 8px;
      .add-btn {
        display: inline-block;
        vertical-align: middle;
        font-size: 0;
        color: #38f;
        i, span {
          vertical-align: middle;
          font-size: 12px;
        }
        &:hover {
          color: tint(#38f, 20%);
        }
      }
    }
    &:hover .close-btn-wrapper {
      display: block;
    }
  }
}
</style>
