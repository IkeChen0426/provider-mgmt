<template lang="html">
  <div class="commodity-group">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="editCommidityGroup()">新建分组</el-button>
    </div>

    <div class="table">
      <el-table :data="commodityGroupList" border>
        <el-table-column label="分组" prop="displayName"></el-table-column>
        <el-table-column label="分组下商品" prop="taggingCount"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="editCommidityGroup(scope.row.id)">编辑</el-button>
            <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <commodity-group-edit :visible.sync="commodityGroupEdit.visible" :group-id="commodityGroupEdit.groupId" @done="GetGroupList"></commodity-group-edit>
  </div>
</template>

<script>
import { deleteSpaceTag } from '@/api/spaceTags'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CommodityGroup',
  components: {
    CommodityGroupEdit: () => import('./components/CommodityGroupEdit')
  },
  data () {
    return {
      commodityGroupEdit: {
        visible: false,
        groupId: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'commodityGroupSpaceId',
      'commodityGroupList'
    ])
  },
  mounted () {
    this.GetGroupList()
  },
  methods: {
    ...mapActions([
      'GetGroupList'
    ]),
    handleDelete (item) {
      if (item.taggingCount) {
        this.$message.warning('请先移除该分类下的所有商品！')
      } else {
        this.$confirm('确认删除？', '提示', {
          type: 'warning'
        }).then(res => {
          this.deleteGroup(item.id)
        }).catch(err => {
          console.log(err)
        })
      }
    },
    deleteGroup (tagId) {
      deleteSpaceTag({ spaceId: this.commodityGroupSpaceId, tagId }).then(res => {
        this.$message.success('删除成功')
        this.GetGroupList()
      })
    },
    editCommidityGroup (id = null) {
      this.commodityGroupEdit = {
        visible: true,
        groupId: id
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.commodity-group {
  padding: 20px;
}
</style>
