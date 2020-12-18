import request from '@/utils/request'

export function login(params) {
  return request({
    // url: '//' + process.env.VUE_APP_BASE_HOST + '/api/login',
    url: process.env.VUE_APP_BASE_HOST + '/api/login',
    method: 'post',
    data: params
  })
}

export function getInfo(token) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/api/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/api/user/logout',
    method: 'post'
  })
}
