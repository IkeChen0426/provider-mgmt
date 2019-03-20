import request from '@/utils/request'

// 获取空间标签列表
export function getSpaceTags ({ spaceId, groupBy }) {
  return request({
    url: `/s/spaces/${spaceId}/tgs`,
    method: 'get',
    params: {
      groupBy
    }
  })
}

// 创建空间标签
export function createSpaceTag ({ spaceId, data }) {
  return request({
    url: `/s/spaces/${spaceId}/tgs`,
    method: 'post',
    data
  })
}

// 获取空间标签
export function getSpaceTag ({ spaceId, tagId }) {
  return request({
    url: `/s/spaces/${spaceId}/tgs/${tagId}`,
    method: 'get'
  })
}

// 更新空间标签
export function updateSpaceTag ({ spaceId, tagId, data }) {
  return request({
    url: `/s/spaces/${spaceId}/tgs/${tagId}`,
    method: 'put',
    data
  })
}

// 删除空间标签
export function deleteSpaceTag ({ spaceId, tagId }) {
  return request({
    url: `/s/spaces/${spaceId}/tgs/${tagId}`,
    method: 'delete'
  })
}
