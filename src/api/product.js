import request from '@/utils/request'

export function getList(params) {
  console.log('product getList:', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/product/list_all',
    method: 'get',
    params
  })
}

export function remove(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/product/remove',
    method: 'post',
    data: params
  })
}

export function add(params) {
  console.log('product add::::', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/product/save',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  console.log('product edit::::', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/product/save',
    method: 'post',
    data: params
  })
}

