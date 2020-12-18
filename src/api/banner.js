import request from '@/utils/request'

export function getList(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/banner/list_all',
    method: 'get',
    params
  })
}

export function remove(params) {
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/banner/remove',
    method: 'delete',
    data: params
  })
}

export function add(params) {
  console.log('add:::', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/banner/save',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  console.log('banner edit:::', params)
  return request({
    url: process.env.VUE_APP_BASE_HOST + '/admin/api/banner/save',
    method: 'post',
    data: params
  })
}

