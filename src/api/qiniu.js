import request from '@/utils/request'

export function getToken () {
  return request({
    url: '/qiniu/uptoken',
    method: 'get'
  })
}
