import request from '@/utils/request'

export function getBriefinfo (params) {
  return request({
    url: '/s/spaces/tags/briefinfo',
    method: 'get',
    params: params
  })
}
