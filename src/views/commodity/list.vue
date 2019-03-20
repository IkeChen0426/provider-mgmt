<template lang="html">
  <div class="commodity-list">
    <div class="filter-container">
      <el-input placeholder="商品名称" v-model="query.title" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-input placeholder="商品编码" v-model="query.no" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="getList" />
      <el-cascader placeholder="商品类目"
        v-model="typeTagIds"
        :change-on-select="true"
        :options="tags"
        :props="{ value: 'id', label: 'displayName' }"
        clearable
        @change="getSubTags">
      </el-cascader>
      <el-select v-model="query.selfTagId" placeholder="店内分组" clearable>
        <el-option v-for="item of commodityGroupList" :key="item.id" :value="item.id" :label="item.displayName"></el-option>
      </el-select>
      <el-date-picker
        v-model="date"
        type="daterange"
        align="right"
        value-format="timestamp"
        start-placeholder="创建时间段"
        end-placeholder="创建时间段"
        :picker-options="dateOptions">
      </el-date-picker>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        :data="commodityList"
        style="width:100%"
        v-loading="listLoading"
        border>
          <el-table-column type="selection" width="55"/>
          <el-table-column prop="no" label="商品编号"/>
          <el-table-column label="商品图片" width="100">
            <template slot-scope="scope">
              <img width="50px" height="50px" :src="scope.row.coverUri"/>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="商品名称"/>
          <el-table-column prop="tags" label="商品分类">
            <template slot-scope="scope">
              <span>{{scope.row.typeTgs?scope.row.typeTgs[0].display+'/'+scope.row.typeTgs[1].display:''}}</span>
            </template>
          </el-table-column>
          <el-table-column label="店内分组" class-name="commodity-group">
            <template slot-scope="scope">
              <span v-for="item of scope.row.tgs" :key="item.id">{{ item.display }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格"/>
          <el-table-column label="总库存" width="100">
            <template slot-scope="scope">
              <span>{{scope.row.stockPieces===-1?'无限':scope.row.stockPieces}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="salePieces" label="总销量" width="100"/>
          <el-table-column label="创建时间" width="100">
            <template slot-scope="scope">
              <span>{{scope.row.creationTime | parseTime}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="handleEdit(scope.row.id)">编辑商品</el-button>
          </template>
          </el-table-column>
      </el-table>
    </div>
    <div class="operation-bar">
      <div>
        <el-button @click="selectThisPage">当页全选</el-button>
        <el-button @click="upShelf">上架</el-button>
      </div>
      <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="query.limit" />
    </div>
  </div>
</template>

<script>
import { getBriefinfo } from '@/api/productTags'
import { getProductsByShop, changeShelfStatus } from '@/api/product'
import { find, last } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CommodityList',
  components: {
    Pagination: () => import('@/components/Pagination')
  },
  data () {
    return {
      listLoading: false,
      query: {
        offset: 0,
        limit: 10,
        tai: null,
        saleType: 2,
        title: null,
        visible: false,
        needShop: false,
        no: null,
        startCreationTime: null,
        endCreationTime: null,
        orderBy: 'creationTime_desc',
        tagId: null,
        selfTagId: null
      },
      typeTagIds: [], // 平台类目id
      total: 0,
      dateOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      tags: [],
      commodityList: []
    }
  },
  created () {
    this.getTags()
    this.getList()
    this.GetGroupList()
  },
  computed: {
    ...mapGetters([
      'commodityGroupList'
    ]),
    date: {
      get () {
        return this.query.startCreationTime ? [this.query.startCreationTime, this.query.endCreationTime] : ''
      },
      set (value) {
        this.query.startCreationTime = value ? value[0] : null
        this.query.endCreationTime = value ? value[1] : null
      }
    },
    page: {
      get () {
        return parseInt(this.query.offset / this.query.limit) + 1
      },
      set (value) {
        this.query.offset = (value - 1) * this.query.limit
      }
    }
  },
  watch: {
    'query.offset': 'getList',
    'query.limit': 'getList',
    typeTagIds (ids) {
      this.query.tagId = last(ids) || null
    }
  },
  methods: {
    ...mapActions([
      'GetGroupList'
    ]),
    getTags () {
      getBriefinfo().then(res => {
        let { code, data, message } = res.data || {}

        if (code === '0') {
          data.forEach(item => { item.children = [] })
          this.tags = data
        } else {
          this.$message.error(message)
        }
      })
    },
    getSubTags ([id]) {
      const target = find(this.tags, item => item.id === id)

      if (target && target.children && target.children.length === 0) {
        getBriefinfo({ pid: id }).then(res => {
          if (res.data.code === '0') {
            target.children = res.data.data
          } else {
            this.$message.error(res.data.message)
          }
        })
      }
    },
    getList () {
      this.listLoading = true
      getProductsByShop({ ...this.query }).then(res => {
        if (res.data.code === '0') {
          this.commodityList = res.data.data
          this.total = res.data.count
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    selectThisPage () {
      this.$refs.multipleTable.toggleAllSelection()
    },
    upShelf () {
      const productIds = this.$refs.multipleTable.selection.map(e => e.id)
      if (productIds.length > 0) {
        changeShelfStatus({
          shelfStatus: 'up_shelf',
          productIds
        }).then(res => {
          if (res.data.code === '0') {
            this.$message({
              message: '上架成功',
              type: 'success'
            })
            this.getList()
          }
        })
      } else {
        this.$message({
          message: '请选择商品',
          type: 'warning'
        })
      }
    },
    handleEdit (id) {
      this.$router.push({
        name: 'CommodityEdit',
        params: { id }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.commodity-list {
  padding: 20px;
  .filter-container > * {
    vertical-align: top;
    margin: 0 10px 10px 0;
  }
  .operation-bar {
    margin-top: 20px;
    padding: 32px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    >>> .pagination-container {
      margin: 0;
      padding: 0;
    }
  }
  .commodity-group span + span::before {
    content: "、";
  }
}
</style>
