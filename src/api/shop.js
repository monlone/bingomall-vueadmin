import request from '../utils/request'

export function getList(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/shop/list',
    method: 'get',
    params
  })
}

export function remove(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/shop_remove',
    method: 'post',
    data: params
  })
}

export function add(params) {
  console.log('shop add:', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/shop/save',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  console.log('shop edit:', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/shop/save',
    method: 'post',
    data: params
  })
}

