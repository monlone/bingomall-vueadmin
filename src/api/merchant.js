import request from '@/utils/request'

export function getList(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/api/app/merchant_list',
    method: 'get',
    params
  })
}

export function remove(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/api/app/merchant_remove',
    method: 'post',
    data: params
  })
}

export function add(params) {
  console.log('merchant add:', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/api/merchant/save',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/api/merchant/save',
    method: 'post',
    data: params
  })
}

