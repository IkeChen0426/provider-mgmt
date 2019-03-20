<template lang="html">
  <div class="commodity-sale">
    <div class="filter-container">
      <el-input :placeholder="query1.placeholder" clearable v-model="query1.value" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-input :placeholder="query2.placeholder" clearable v-model="query2.value" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-cascader
        :placeholder="query3.placeholder"
        v-model="query3.value"
        :change-on-select="true"
        :options="query3.options"
        :props="{ value: 'id', label: 'displayName' }"
        clearable
        @change="getSubTags">
      </el-cascader>
      <el-select v-model="query.selfTagId" placeholder="店内分组" clearable>
        <el-option v-for="item of commodityGroupList" :key="item.id" :value="item.id" :label="item.displayName"></el-option>
      </el-select>
      <el-date-picker
        v-model="query4.value"
        type="datetimerange"
        range-separator="至"
        start-placeholder="创建时间段"
        end-placeholder="创建时间段"
        align="right">
      </el-date-picker>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter" style="width: 100px;">搜索</el-button>
    </div>
    <div class="table">
      <el-table
        ref="multipleTable"
        v-loading="listLoading"
        :data="tableData3"
        border
        fit
        highlight-current-row
        tooltip-effect="dark"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="no" label="商品编号"/>
        <el-table-column label="商品图片" width="100">
          <template slot-scope="scope">
            <img width="50px" height="50px" :src="scope.row.coverUri+'?imageMogr2/thumbnail/50x50'"/>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="商品名称">
          <template slot-scope="scope">
            <div class="goods">
              <div class="name">{{scope.row.title}} </div>
            </div>
          </template>
        </el-table-column>
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
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="stockPieces" label="总库存" show-overflow-tooltip></el-table-column>
        <el-table-column prop="salePieces" label="总销量" show-overflow-tooltip></el-table-column>
        <el-table-column label="创建时间" show-overflow-tooltip>
          <template slot-scope="scope"><span>{{ scope.row.creationTime | parseTime }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row.id)" type="text" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="operation-bar">
        <div>
          <el-button @click="selectThisPage">当页全选</el-button>
          <el-button @click="downShelf">下架</el-button>
        </div>
        <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="listQuery.limit" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { getProductsByShop, changeShelfStatus } from '@/api/product'
import { getBriefinfo } from '@/api/productTags'
import { find, last } from 'lodash'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CommoditySale',
  components: {
    Pagination: () => import('@/components/Pagination')
  },
  directives: { waves },
  data () {
    return {
      listLoading: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        offset: 0,
        dataSource: ''
      },
      query1: {
        placeholder: '商品名称',
        value: ''
      },
      query2: {
        placeholder: '商品编码',
        value: ''
      },
      query3: {
        options: [],
        placeholder: '商品类目',
        value: []
      },
      query4: {
        placeholder: '创建时间',
        value: null
      },
      query: {
        selfTagId: null
      },
      tableData3: []
    }
  },
  created () {
    this.getList()
    this.getTags()
    this.GetGroupList()
  },
  computed: {
    ...mapGetters([
      'commodityGroupList'
    ]),
    page: {
      get () {
        return parseInt(this.listQuery.offset / this.listQuery.limit) + 1
      },
      set (value) {
        this.listQuery.offset = (value - 1) * this.listQuery.limit
      }
    }
  },
  methods: {
    ...mapActions([
      'GetGroupList'
    ]),
    getList (e) {
      this.listLoading = true
      this.listQuery.limit = e ? e.limit : this.listQuery.limit
      let parmars = {
        ...this.query,
        saleType: 2,
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
        visible: true,
        tagId: last(this.query3.value),
        orderBy: 'creationTime_desc',
        title: this.query1.value,
        startCreationTime: this.query4.value ? new Date(this.query4.value[0]).getTime() : '',
        endCreationTime: this.query4.value ? new Date(this.query4.value[1]).getTime() : ''
      }
      getProductsByShop(parmars).then(response => {
        let list = response.data.data || []
        this.total = response.data.count
        if (list.length) {
          list.forEach((item, index) => {
            item.stockPieces = item.stockPieces === -1 ? '无限库存' : item.stockPieces
            item.salePieces = item.salePieces || 0
            item.creationTime = item.creationTime || '--'
          })
        }
        this.tableData3 = list
        this.listLoading = false
      })
    },
    getTags () {
      getBriefinfo().then(res => {
        let { code, data, message } = res.data || {}

        if (code === '0') {
          data.forEach(item => { item.children = [] })
          this.query3.options = data
        } else {
          this.$message.error(message)
        }
      })
    },
    getSubTags ([id]) {
      const target = find(this.query3.options, item => item.id === id)

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
    handleFilter () {
      this.getList()
    },
    selectThisPage () {
      this.$refs.multipleTable.toggleAllSelection()
    },
    downShelf () {
      changeShelfStatus({
        shelfStatus: 'down_shelf',
        productIds: this.$refs.multipleTable.selection.map(e => e.id)
      }).then(res => {
        if (res.data.code === '0') {
          this.$message({
            message: '下架成功',
            type: 'success'
          })
          this.getList()
        }
      })
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
.commodity-sale {
  padding: 20px;
  .filter-container > * {
    vertical-align: top;
    margin: 0 10px 10px 0;
  }
  .goods {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .name {
      overflow: hidden;
    }
  }
  .name {
    overflow: hidden;
    margin-left: 10px;
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
