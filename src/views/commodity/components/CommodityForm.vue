<template lang="html">
  <div class="commodity-form-container">
    <el-form ref="form" :model="model" :rules="rules" label-width="120px">
      <sticky class-name="sub-navbar draft" :z-index="999">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">保存</el-button>
      </sticky>

      <div class="commodity-form-main-container">
        <div class="commodity-form-item">
          <h4 class="commodity-form-title">基本信息</h4>

          <el-form-item label="商品编码">
            <el-input class="commodity-form-input" v-model="model.no" placeholder="商家自定义；用户商家内部管理使用"></el-input>
          </el-form-item>

          <el-form-item label="商品名称" prop="title">
            <el-input class="commodity-form-input" v-model="model.title" placeholder="例如：阿克苏苹果 50斤装"></el-input>
          </el-form-item>

          <el-form-item label="商品分类" prop="_typeTagIds">
            <el-cascader
              :options="briefTags"
              :props="{ value: 'id', label: 'displayName' }"
              v-model="model._typeTagIds"
              @active-item-change="handleItemChange">
            </el-cascader>
          </el-form-item>

          <el-form-item label="店内分组">
            <el-select v-model="model._groupTagIds" placeholder="请选择" multiple>
              <el-option v-for="item of commodityGroupList" :key="item.id" :label="item.displayName" :value="item.id"></el-option>
            </el-select>
            <el-button type="text" @click="$router.push({ name: 'CommodityGroup' })">新建分组</el-button>
          </el-form-item>
        </div>

        <div class="commodity-form-item">
          <h4 class="commodity-form-title">销售信息</h4>

          <el-form-item label="商品设置">
            <property v-model="model.properties"></property>
          </el-form-item>

          <el-form-item ref="productModels" label="规格信息" v-show="isMultipleModels" prop="productModels">
            <model v-model="model.productModels" :properties="model.properties" :show-stock-pieces="model._isCustomStockPieces"></model>
          </el-form-item>

          <el-form-item label="商品价格" prop="price">
            <el-input ref="priceInput" class="commodity-form-input-number" :value="price" @change="price = $event" :disabled="isMultipleModels"></el-input>
          </el-form-item>

          <el-form-item label="默认销量" prop="baseSalePieces">
            <el-input class="commodity-form-input-number" v-model.number="baseSalePieces"></el-input> 件
          </el-form-item>

          <el-form-item label="商品库存" prop="stockPieces">
            <el-radio-group class="commodity-form-radio-group" v-model="model._isCustomStockPieces">
              <div class="commodity-form-radio-container">
                <el-radio class="commodity-form-radio" :label="true">设置库存</el-radio>
                <el-input
                  ref="stockPieces"
                  class="commodity-form-input-number"
                  :value="stockPieces"
                  @change="stockPieces = $event"
                  :disabled="isMultipleModels"
                  v-if="model._isCustomStockPieces">
                </el-input>
              </div>
              <div class="commodity-form-radio-container">
                <el-radio class="commodity-form-radio" :label="false">不限库存</el-radio>
              </div>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="commodity-form-item">
          <h4 class="commodity-form-title">图文描述</h4>

          <el-form-item label="商品图片" prop="_imageUris">
            <dropzone :default-img.sync="model._imageUris" :pick-img.sync="model.coverUri" :max-files="6"></dropzone>
          </el-form-item>

          <el-form-item label="图文详情" prop="description">
            <tinymce v-model="model.description" />
          </el-form-item>
        </div>

        <div class="commodity-form-item">
          <h4 class="commodity-form-title">配送信息</h4>

          <el-form-item label=" ">
            <el-radio-group class="commodity-form-radio-group" v-model="model._isFreePostage">
              <div class="commodity-form-radio-container">
                <el-radio class="commodity-form-radio" :label="true">包邮</el-radio>
              </div>
              <div class="commodity-form-radio-container">
                <el-radio class="commodity-form-radio" :label="false">运费</el-radio>
                <el-input-number
                  class="commodity-form-input-number"
                  v-model="expressCost"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  @keydown.native.stop
                  v-if="!model._isFreePostage">
                </el-input-number>
              </div>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="commodity-form-item">
          <h4 class="commodity-form-title">上架时间</h4>

          <el-form-item label=" ">
            <el-radio-group class="commodity-form-radio-group" v-model="model.visible">
              <div class="commodity-form-radio-container">
                <el-radio class="commodity-form-radio" :label="true">立即上架</el-radio>
              </div>
              <div class="commodity-form-radio-container">
                <el-radio class="commodity-form-radio" :label="false">放入仓库</el-radio>
              </div>
            </el-radio-group>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getBriefinfo } from '@/api/productTags'
import { getProduct, createProduct, updateProduct, updateProductTags } from '@/api/product'
import { find, map, cloneDeep, assignWith, reduce, random, isNil } from 'lodash'
import Big from 'big.js'
import { mapGetters, mapActions } from 'vuex'

const defaultProductModel = {
  modelName: '默认',
  priceInCents: null,
  price: null,
  spec: 'default',
  stockPieces: null
}

const defaultModel = {
  saleType: '2',
  cate: 'material',
  no: null,
  title: null,
  properties: [],
  productModels: [],
  imageUris: [],
  expressCost: 0,
  visible: true,
  description: null,
  baseSalePieces: null,
  _typeTagIds: [], // 平台类目id列表
  _groupTagIds: [], // 商家分类id列表
  _defaultProductModel: cloneDeep(defaultProductModel), // 默认规格
  _isCustomStockPieces: false, // 是否自定义库存
  _imageUris: [], // 图片地址列表
  _isFreePostage: true // 是否包邮
}

export default {
  name: 'CommodityForm',
  props: ['isEdit'],
  components: {
    Sticky: () => import('@/components/Sticky'),
    Property: () => import('./Property'),
    Model: () => import('./Model'),
    Dropzone: () => import('@/components/Dropzone'),
    Tinymce: () => import('@/components/Tinymce')
  },
  data () {
    const validateCoverUri = (rule, value, callback) => {
      let { _imageUris, coverUri } = this.model

      if (!_imageUris || _imageUris.length === 0) {
        callback(new Error('商品图片不能为空'))
      } else if (_imageUris.indexOf(coverUri) === -1) {
        callback(new Error('请选择商品主图'))
      } else {
        callback()
      }
    }

    const validateProductModels = (rule, value, callback) => {
      if (this.isMultipleModels) {
        const { _isCustomStockPieces, productModels } = this.model // 库存是自定义的（每种规格的库存单独设置）
        const invalidPriceInCents = productModels.some(({ priceInCents }) => priceInCents === null) // 有不合法的价格值
        const invalidStockPieces = _isCustomStockPieces && productModels.some(({ stockPieces }) => stockPieces === null) // 有不合法的库存值
        const invalidMessages = []

        invalidPriceInCents && invalidMessages.push('价格')
        invalidStockPieces && invalidMessages.push('库存')

        if (invalidMessages.length > 0) {
          callback(new Error('请输入正确的' + invalidMessages.join('和')))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    const validatePrice = (rule, value, callback) => {
      if (this.isMultipleModels) {
        callback()
      } else {
        let priceInCents = this.model._defaultProductModel.priceInCents

        if (isNil(priceInCents)) {
          callback(new Error('请输入商品价格'))
        } else {
          callback()
        }
      }
    }

    const validateStockPieces = (rule, value, callback) => {
      const { _isCustomStockPieces, _defaultProductModel: { stockPieces } } = this.model

      if (_isCustomStockPieces && !this.isMultipleModels && isNil(stockPieces)) {
        callback(new Error('请输入商品库存'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      model: cloneDeep(defaultModel),
      briefTags: [],
      rules: {
        title: [{ required: true, trigger: 'change', message: '商品名称不能为空' }],
        _typeTagIds: [{ required: true, trigger: 'change', type: 'array', min: 2, message: '商品分类不能为空' }],
        _imageUris: [
          { required: true, trigger: 'change', type: 'array', min: 1, message: '商品图片不能为空' },
          { trigger: 'change', validator: validateCoverUri }
        ],
        description: [{ required: true, trigger: 'change', message: '图文详情不能为空' }],
        baseSalePieces: [{ type: 'integer', trigger: 'change', message: '请输入整数' }],
        productModels: [{ required: true, trigger: 'change', validator: validateProductModels }],
        price: [{ required: true, trigger: 'change', validator: validatePrice }],
        stockPieces: [{ required: true, trigger: 'change', validator: validateStockPieces }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'commodityGroupList'
    ]),
    /**
     * 是否多规格
     * @return {Boolean}
     */
    isMultipleModels () {
      return this.model.properties.length > 0
    },
    price: {
      get () {
        let { productModels, _defaultProductModel } = this.model

        if (this.isMultipleModels) {
          let prices = map(productModels, ({ priceInCents }) => priceInCents)
          let minPrice = (Math.min(...prices) / 100).toFixed(2)
          let maxPrice = (Math.max(...prices) / 100).toFixed(2)

          return minPrice === maxPrice ? minPrice : `${minPrice}-${maxPrice}`
        } else {
          let priceInCents = _defaultProductModel.priceInCents
          return priceInCents === null ? null : priceInCents / 100
        }
      },
      set (newValue) {
        if (!this.isMultipleModels) {
          try {
            let price = new Big(newValue)

            assignWith(this.model._defaultProductModel, {
              priceInCents: Number(price.times(100).round()),
              price: price.toFixed(2)
            })
          } catch (e) {
            assignWith(this.model._defaultProductModel, {
              priceInCents: null,
              price: null
            })
          }

          this.$refs.priceInput.setCurrentValue(this.price)
        }
      }
    },
    stockPieces: {
      get () {
        let { _isCustomStockPieces, productModels, _defaultProductModel } = this.model

        if (_isCustomStockPieces) {
          if (this.isMultipleModels) {
            return reduce(productModels, (sum, { stockPieces }) => sum + stockPieces, 0)
          } else {
            let stockPieces = _defaultProductModel.stockPieces

            return isNil(stockPieces) ? null : stockPieces
          }
        } else {
          return -1
        }
      },
      set (newValue) {
        let { _isCustomStockPieces, productModels, _defaultProductModel } = this.model

        if (_isCustomStockPieces) {
          if (!this.isMultipleModels) {
            try {
              let price = new Big(newValue)

              _defaultProductModel.stockPieces = Number(price.round())
            } catch (e) {
              _defaultProductModel.stockPieces = null
            }

            this.$refs.stockPieces.setCurrentValue(this.stockPieces)
          }
        } else {
          productModels.forEach(item => {
            item.stockPieces = -1
          })
        }
      }
    },
    expressCost: {
      get () {
        return this.model.expressCost / 100
      },
      set (newValue) {
        this.model.expressCost = Number(new Big(newValue || 0).times(100).round())
      }
    },
    baseSalePieces: {
      get () {
        return this.model.baseSalePieces
      },
      set (newValue) {
        this.model.baseSalePieces = newValue === '' ? null : newValue
      }
    }
  },
  watch: {
    commodityGroupList (newList) {
      if (this.model && this.model._groupTagIds) {
        this.model._groupTagIds = this.model._groupTagIds.filter(id => find(newList, item => item.id === id))
      }
    },
    isMultipleModels () {
      this.$refs.productModels.clearValidate() // 默认规格和自定义规格之间切换时，重置“规格信息”的校验结果
    },
    'model._isCustomStockPieces' () {
      const { productModels, form } = this.$refs

      productModels.validateState && form.validateField('productModels')
    }
  },
  methods: {
    ...mapActions([
      'GetGroupList'
    ]),
    /**
     * 获取商品分类列表
     * @param  {String} pid 父分类id，为空时获取一级分类列表
     * @return {Promise}    返回列表
     */
    getBriefTags (pid) {
      return new Promise((resolve, reject) => {
        getBriefinfo({ pid }).then(res => {
          let data = res.data.data

          data.forEach(item => { !item.pid && (item.children = []) })

          resolve(data)
        }).catch(() => {
          resolve([])
        })
      })
    },
    async handleItemChange (selection) {
      if (!this.briefTags || this.briefTags.length === 0) {
        this.briefTags = await this.getBriefTags()
      }
      let list = this.briefTags

      for (let i = 0, l = selection.length; i < l; i++) {
        let id = selection[i]
        let target = find(list, item => item.id === id) // 当前id对应的tag对象

        if (target) {
          if (target.children) {
            if (target.children.length === 0) {
              target.children = await this.getBriefTags(target.id)
            }
            list = target.children
          } else {
            selection.splice(i + 1, l - i - 1) // 已经没有子tag了，将他后面的tagIds都移除
            break
          }
        } else {
          selection.splice(i, l - i) // 未找到对应的tag对象，将他自身及后面的tagIds都移除
          break
        }
      }
    },
    getCommodity (productId) {
      return getProduct({ productId }).then(res => {
        this.model = this.formatCommodity(res.data)
        return this.handleItemChange(this.model._typeTagIds) // 获取级联选择器初始数据
      })
    },
    /**
     * 后端返回数据-->前端表单数据
     */
    formatCommodity (rawData) {
      let data = cloneDeep(rawData)

      // 平台类目处理
      data._typeTagIds = map(data.typeTgs, ({ id }) => id)

      // 商家分组处理
      data._groupTagIds = map(data.tgs, ({ id }) => id)

      // 库存类型处理（设置/无限库存）
      data._isCustomStockPieces = data.productModels.every(({ stockPieces }) => stockPieces !== -1)

      // 默认规格处理
      if (data.properties.length === 0) { // 单规格（默认规格）
        data._defaultProductModel = assignWith(
          cloneDeep(defaultProductModel),
          data.productModels[0] || {},
          (def, src) => isNil(src) ? def : src
        )
        data.productModels = []
      } else { // 多规格
        data._defaultProductModel = cloneDeep(defaultProductModel)
      }

      // 图片处理
      data._imageUris = map(data.imageUris, ({ uri }) => uri)

      // 邮费处理
      data._isFreePostage = !data.expressCost

      return data
    },
    /**
     * 前端表单数据-->后端数据
     */
    parseCommodity (formData) {
      let data = cloneDeep(formData)

      // 平台类目处理
      data.tgs = [{ id: data._typeTagIds[1] }]

      // 商家分组处理（创建时）
      if (!data.id && data._groupTagIds && data._groupTagIds.length > 0) {
        data.tgs = data.tgs.concat(map(data._groupTagIds, id => ({ id })))
      }

      // 规格处理
      if (data.properties.length === 0) { // 单规格（默认规格）
        data.productModels = [data._defaultProductModel]
      }

      // 库存处理
      if (!data._isCustomStockPieces) { // 无限库存，将所有库存变成-1
        data.productModels.forEach(item => {
          item.stockPieces = -1
        })
      }

      // 图片处理
      data.imageUris = map(data._imageUris, uri => ({ uri }))

      // 邮费处理
      if (data._isFreePostage) {
        data.expressCost = 0
      }

      // 默认销量处理
      if (data.id) {
        // 更新时如果没填默认销量，改成0
        data.baseSalePieces = data.baseSalePieces || 0
      } else {
        // 创建时如果没填默认销量，改成随机值（50-300）
        data.baseSalePieces = data.baseSalePieces === null ? random(50, 300) : data.baseSalePieces
      }

      return data
    },
    submitForm () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.isEdit ? this.updateCommodity() : this.createCommodity()
        } else {
          this.$message.warning('请正确填写信息')
        }
      })
    },
    createCommodity () {
      createProduct({ data: this.parseCommodity(this.model) }).then(res => {
        this.$message.success('上传商品成功')
        this.$store.dispatch('delCachedView', this.$route).then(() => {
          const { fullPath } = this.$route
          this.$nextTick(() => {
            this.$router.replace({
              path: '/redirect' + fullPath
            })
          })
        })
      })
    },
    updateCommodity () {
      let commodityId = this.$route.params.id
      let commodityData = this.parseCommodity(this.model)
      let tags = map(this.commodityGroupList, ({ id }) => ({
        enable: commodityData._groupTagIds.indexOf(id) !== -1,
        resource: { id }
      }))

      Promise.all([
        updateProduct({ productId: commodityId, data: commodityData }),
        updateProductTags({ productId: commodityId, data: tags })
      ]).then(res => {
        this.$message.success('更新商品成功')
      })
    }
  },
  async mounted () {
    this.GetGroupList()
    if (this.isEdit) {
      await this.getCommodity(this.$route.params.id)
    } else {
      this.handleItemChange(this.model._typeTagIds)
    }
    this.$refs.form.clearValidate()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
@import "~@/styles/mixin.scss";
.commodity-form-container {
  position: relative;
  .sub-navbar {
    right: 0;
    left: 0;
    width: auto!important;
  }
  .commodity-form-main-container {
    padding: 50px;
    .commodity-form-item {
      .commodity-form-title {
        padding: .5em;
        border-bottom: 1px solid #ebebeb;
      }
      .commodity-form-input {
        max-width: 300px;
      }
      .commodity-form-input-number {
        max-width: 150px;
      }
      .commodity-form-radio-group {
        line-height: inherit;
        .commodity-form-radio-container {
          > * {
            margin-right: 10px;
            vertical-align: middle;
          }
        }
      }
    }
  }
}
</style>
