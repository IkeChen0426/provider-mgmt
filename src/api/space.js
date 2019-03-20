import request from '@/utils/request'

// 获取空间
export function getSpaces ({ offset, limit, parentId, wxUIN, typeCode }) {
  return request({
    url: '/s/spaces/',
    method: 'get',
    params: {
      offset,
      limit,
      parentId,
      wxUIN,
      typeCode
    }
  })
}
