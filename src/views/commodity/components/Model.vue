<template>
  <div class="commodity-model">
    <table>
      <thead>
        <tr>
          <th v-for="item of heads">{{ item }}</th>
          <th>价格（元）</th>
          <th v-if="showStockPieces">库存</th>
          <th>销量</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, rowIndex) of models">
          <td v-for="(facet, colIndex) of item.facets" :rowspan="getRowspan(colIndex, rowIndex)" v-if="getRowspan(colIndex, rowIndex)">{{ facet }}</td>
          <td class="price-control">
            <el-input ref="priceInCents" :class="{ 'valid-fields': item.priceInCents !== null }" :value="getPrice(item)" @change="setPrice(item, $event, rowIndex)"></el-input>
          </td>
          <td class="price-control" v-if="showStockPieces">
            <el-input ref="stockPieces" :class="{ 'valid-fields': item.stockPieces !== null }" :value="getStockPieces(item)" @change="setStockPieces(item, $event, rowIndex)"></el-input>
          </td>
          <td class="sale-pieces">{{ item.salePieces || 0 }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td :colspan="heads.length + 2 + (showStockPieces || 0)">
            <div class="batch-opts">
              <span>批量设置：</span>
              <template v-if="batchPrice.inputVisible">
                <el-input-number class="valid-fields" v-model="batchPrice.inputValue" :min="0" :step="0.01" :precision="2" :controls="false"></el-input-number>
                <el-button type="text" @click="confirmPriceInput">确定</el-button>
                <el-button type="text" @click="hideInput(batchPrice)">取消</el-button>
              </template>
              <template v-else-if="showStockPieces && batchStock.inputVisible">
                <el-input-number class="valid-fields" v-model="batchStock.inputValue" :min="0" :precision="0" :controls="false"></el-input-number>
                <el-button type="text" @click="confirmStockInput">确定</el-button>
                <el-button type="text" @click="hideInput(batchStock)">取消</el-button>
              </template>
              <template v-else>
                <el-button type="text" @click="batchPrice.inputVisible = true">价格</el-button>
                <el-button type="text" v-if="showStockPieces" @click="batchStock.inputVisible = true">库存</el-button>
              </template>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import Big from 'big.js'
import { find, assign, map, isNumber } from 'lodash'
import Emitter from '@/mixins/emitter'

const Model = function ({ facets }) {
  this.facets = facets
  this.price = null
  this.priceInCents = null
  this.stockPieces = null
}

export default {
  name: 'CommodityModel',
  mixins: [Emitter],
  props: ['value', 'properties', 'showStockPieces'],
  data () {
    return {
      batchPrice: {
        inputVisible: false,
        inputValue: 0
      },
      batchStock: {
        inputVisible: false,
        inputValue: 0
      }
    }
  },
  computed: {
    heads () {
      return map(this.properties, ({ name }) => name)
    },
    models: {
      get () {
        return this.value
      },
      set (newValue) {
        this.$emit('input', newValue)
        this.dispatch('ElFormItem', 'el.form.change', newValue)
      }
    }
  },
  methods: {
    getPriceObj (value) {
      try {
        let price = new Big(value)

        if (price < 0) throw new Error('价格不能小于0')

        return {
          priceInCents: Number(price.times(100).round()),
          price: price.toFixed(2)
        }
      } catch (e) {
        return {
          priceInCents: null,
          price: null
        }
      }
    },
    getPrice ({ priceInCents }) {
      return isNumber(priceInCents) ? Number(new Big(priceInCents).div(100)) : priceInCents
    },
    setPrice (item, value, index) {
      assign(item, this.getPriceObj(value))
      this.$refs.priceInCents[index].setCurrentValue(this.getPrice(item))
    },
    getStockPieces ({ stockPieces }) {
      return stockPieces
    },
    setStockPieces (item, value, index) {
      try {
        let stockPieces = new Big(value)

        if (value < 0) throw new Error('库存不能小于0')

        item.stockPieces = Number(stockPieces.round())
      } catch (e) {
        item.stockPieces = null
      }
      this.$refs.stockPieces[index].setCurrentValue(item.stockPieces)
    },
    confirmPriceInput () {
      let priceObj = this.getPriceObj(this.batchPrice.inputValue)

      this.models.forEach(item => { assign(item, priceObj) })

      this.hideInput(this.batchPrice)
      this.dispatch('ElFormItem', 'el.form.change', this.models)
    },
    confirmStockInput () {
      let newValue = this.batchStock.inputValue
      let stockPieces = newValue === undefined ? null : newValue

      this.models.forEach(item => { item.stockPieces = stockPieces })

      this.hideInput(this.batchStock)
      this.dispatch('ElFormItem', 'el.form.change', this.models)
    },
    hideInput (target) {
      target.inputVisible = false
      target.inputValue = 0
    },
    descartes (list) {
      // parent上一级索引;count指针计数
      var point = {}
      var result = []
      var pIndex = null
      var tempCount = 0
      var temp = []
      // 根据参数列生成指针对象
      for (var index in list) {
        if (typeof list[index] === 'object') {
          point[index] = { 'parent': pIndex, 'count': 0 }
          pIndex = index
        }
      }
      // 单维度数据结构直接返回
      if (pIndex === null) {
        return list
      }
      // 动态生成笛卡尔积
      while (true) {
        for (index in list) {
          tempCount = point[index]['count']
          temp.push(list[index][tempCount])
        }
        // 压入结果数组
        result.push(temp)
        temp = []
        // 检查指针最大值问题
        while (true) {
          if (point[index]['count'] + 1 >= list[index].length) {
            point[index]['count'] = 0
            pIndex = point[index]['parent']
            if (pIndex === null) {
              return result
            }
            // 赋值parent进行再次检查
            index = pIndex
          } else {
            point[index]['count']++
            break
          }
        }
      }
    },
    initModels () {
      let props = map(this.properties, ({ values }) => values.filter(val => val))
      let list = this.descartes(props)

      this.models = map(list, facets => {
        let facetStr = facets.join(',')

        return find(this.models, ({ facets, stockPieces }) => facets.join(',') === facetStr) || new Model({ facets })
      })
    },
    getRowspan (colIndex, rowIndex) {
      let span = this.models.length

      for (let i = 0; i <= colIndex; i++) {
        span /= this.properties[i].values.filter(Boolean).length
      }

      return rowIndex % span === 0 ? span : 0
    }
  },
  watch: {
    properties: {
      handler: 'initModels',
      immediage: true
    },
    showStockPieces () {
      this.batchPrice.inputVisible && this.hideInput(this.batchPrice)
      this.batchStock.inputVisible && this.hideInput(this.batchStock)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.commodity-model {
  padding: 0 10px 20px;
  border: 1px solid #e5e5e5;
  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    th, td {
      text-align: center;
    }
    td {
      padding: 8px;
      border: 1px solid #e5e5e5;
      max-width: 100px;
      &:first-of-type {
        border-left: none;
      }
      &:last-of-type {
        border-right: none;
      }
      &.price-control {
        width: 150px;
        .el-input-number {
          max-width: 100%;
        }
      }
      &.sale-pieces {
        max-width: 150px;
      }
      .batch-opts {
        text-align: left;
        line-height: normal;
      }
      .valid-fields input {
        border-color: #dcdfe6!important;
        &:hover {
          border-color: #c0c4cc!important;
        }
        &:focus {
          border-color: #409EFF!important;
        }
      }
    }
  }
}
</style>
