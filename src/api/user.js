import request from '@/utils/request'

export function loginByUsername ({ data }) {
  return request({
    url: '/u/users/login',
    method: 'post',
    data
  })
}

export function getAccount () {
  return request({
    url: '/u/account/',
    method: 'get'
  })
}
