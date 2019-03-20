import request from '@/utils/request'

// 商品列表页面
export function getProductsByShop (params) {
  return request({
    url: '/products2/',
    method: 'get',
    params: params
  })
}

// 批量上下架商品
export function changeShelfStatus ({ shelfStatus, productIds }) {
  return request({
    url: '/products/shelfStatus',
    method: 'put',
    params: {
      shelfStatus,
      productIds
    }
  })
}

// 商品详情
export function getProduct ({ productId }) {
  return request({
    url: `/products/${productId}`,
    method: 'get'
  })
}

// 创建商品
export function createProduct ({ data }) {
  return request({
    url: `/products/`,
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct ({ productId, data }) {
  return request({
    url: `/products/${productId}`,
    method: 'put',
    data
  })
}

// 更新商品标签
export function updateProductTags ({ productId, data }) {
  return request({
    url: `/products/${productId}/tgs`,
    method: 'put',
    data
  })
}
