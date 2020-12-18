<template>
  <div class="app-container">
    <el-form ref="addForm" :model="addForm" label-width="120px" :rules="addFormRules">
      <el-form-item label="商户id" prop="id">
        <el-input v-model="addForm.id" :readonly="true" />
      </el-form-item>
      <el-form-item label="名称" prop="title" required="true">
        <el-input v-model="addForm.title" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="addForm.address" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model="addForm.order_weight" placeholder="填数字（如：1，2），值越大店铺越靠前" />
      </el-form-item>
      <el-form-item label="店铺状态">
        <el-select v-model="addForm.status" placeholder="请选择店铺状态">
          <el-option
            v-for="item in selectList"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="坐标" prop="coordinates" required="true">
        <el-input v-model="addForm.coordinates" @change="setCoordinates" />
        <a target="_blank" href="//lbs.amap.com/api/javascript-api/example/map/click-to-get-lnglat/">点击获取坐标</a>
      </el-form-item>
      <el-form-item label="电话" prop="phone" required="true">
        <el-input v-model="addForm.phone" />
      </el-form-item>
      <el-form-item label="地址描述" prop="address_description">
        <el-input v-model="addForm.address_description" placeholder="比如在肯德基旁边" />
      </el-form-item>
      <el-form-item label="店铺logo" prop="logo" required="true">
        <el-input v-model="addForm.logo" placeholder="请填图片url地址" />
      </el-form-item>
      <el-form-item label="区域" prop="region">
        <el-select v-model="addForm.region" placeholder="请选择您店铺的区域">
          <el-option label="广西" value="guangxi" />
          <el-option label="广东" value="guangdong" />
        </el-select>
      </el-form-item>
      <el-form-item label="营业时间" prop="business_time">
        <el-input v-model="addForm.business_time" placeholder="请填写营业时间及说明" />
      </el-form-item>
      <!-- <el-form-item label="Instant delivery">-->
      <!--        <el-switch v-model="form.delivery" />-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="Activity shop_type">-->
      <!--        <el-checkbox-group v-model="form.shop_type">-->
      <!--          <el-checkbox label="Online activities" name="shop_type" />-->
      <!--          <el-checkbox label="Promotion activities" name="shop_type" />-->
      <!--          <el-checkbox label="Offline activities" name="shop_type" />-->
      <!--          <el-checkbox label="Simple brand exposure" name="shop_type" />-->
      <!--        </el-checkbox-group>-->
      <!--      </el-form-item>-->
      <el-form-item label="商品类型" prop="type">
        <el-radio-group v-model="addForm.type">
          <el-radio label="需要核销" />
          <el-radio label="不需要核销" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="店铺概述" prop="description">
        <el-input v-model="addForm.description" type="textarea" />
      </el-form-item>
      <el-form-item label="店铺详情图文介绍" prop="detailDescribe">
        <tinymce-editor ref="editor" v-model="addForm.detailDescribe" />
      </el-form-item>
      <el-form-item>
        <el-button :loading="addLoading" type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import TinymceEditor from '../../components/Tinymce/tinymce-editor.vue'
import { add } from '../../api/shop'

import amap from '../../utils/amap.js'
import { MapKey, MapCityName } from '../../config/amap'

export default {
  components: {
    TinymceEditor
  },
  data() {
    return {
      searchKey: '',
      placeSearch: null,
      dragStatus: false,
      AMapUI: null,
      AMap: null,
      addForm: {
        id: '',
        title: '',
        region: '',
        phone: '',
        address: '',
        address_description: '',
        description: '',
        longitude: 0,
        latitude: 0,
        detailDescribe: '',
        coordinates: null,
        star: 3,
        logo: '',
        order_weight: null,
        begin_at: null,
        end_at: null,
        status: 1
      },
      // 0:店铺未开通，1:店铺可用，2:冻结，3：永久封店，4：其他
      selectList: [
        { key: 0, name: '店铺未开通' },
        { key: 1, name: '店铺可用' },
        { key: 2, name: '店铺冻结' },
        { key: 3, name: '永久封禁' },
        { key: 4, name: '其他' }
      ],
      addLoading: false,
      addFormRules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ],
        logo: [
          { required: true, message: '请输入店铺logo', trigger: 'blur' }
        ],
        imageUrl: [
          { required: true, message: '请输入店铺图片', trigger: 'blur' }
        ],
        business_time: [
          { required: true, message: '请输入营业时间及说明', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '商户id不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    searchKey() {
      if (this.searchKey === '') {
        this.placeSearch.clear()
      }
    }
  },
  mounted() {
    this.addForm.id = this.$route.query.id
    // 先不嵌入高德地图
    // this.created()
  },
  methods: {
    setCoordinates(val) {
      let coordinates = []
      coordinates = val.split(',')
      this.addForm.longitude = Number(coordinates[0])
      this.addForm.latitude = Number(coordinates[1])
    },
    onSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.addLoading = true
            this.addForm.coordinates = { latitude: this.addForm.latitude, longitude: this.addForm.longitude }
            const para = Object.assign({}, this.addForm)
            add(para).then((res) => {
              this.addLoading = false
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['addForm'].resetFields()
            }).then(function(err) {
              console.log('err:', err)
            })
          })
        }
      })
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    handleSearch() {
      if (this.searchKey) {
        this.placeSearch.search(this.searchKey)
      }
    },
    // 实例化地图
    initMap() {
      // 加载PositionPicker，loadUI的路径参数为模块名中 'ui/' 之后的部分
      const AMapUI = this.AMapUI = window.AMapUI
      const AMap = this.AMap = window.AMap
      AMapUI.loadUI(['misc/PositionPicker'], PositionPicker => {
        const mapConfig = {
          zoom: 16,
          cityName: MapCityName
        }
        if (this.lat && this.lng) {
          mapConfig.center = [this.lng, this.lat]
        }
        const map = new AMap.Map('js-container', mapConfig)
        // 加载地图搜索插件
        AMap.service('AMap.PlaceSearch', () => {
          this.placeSearch = new AMap.PlaceSearch({
            pageSize: 5,
            pageIndex: 1,
            citylimit: true,
            city: MapCityName,
            map: map,
            panel: 'js-result'
          })
        })
        // 启用工具条
        AMap.plugin(['AMap.ToolBar'], function() {
          map.addControl(new AMap.ToolBar({
            position: 'RB'
          }))
        })
        // 创建地图拖拽
        const positionPicker = new PositionPicker({
          mode: 'dragMap', // 设定为拖拽地图模式，可选'dragMap'、'dragMarker'，默认为'dragMap'
          map: map // 依赖地图对象
        })
        // 拖拽完成发送自定义 drag 事件
        positionPicker.on('success', positionResult => {
          // 过滤掉初始化地图后的第一次默认拖放
          if (!this.dragStatus) {
            this.dragStatus = true
          } else {
            this.$emit('drag', positionResult)
          }
        })
        // 启动拖放
        positionPicker.start()
      })
    },
    async created() {
      // 已载入高德地图API，则直接初始化地图
      if (window.AMap && window.AMapUI) {
        this.initMap()
        // 未载入高德地图API，则先载入API再初始化
      } else {
        await amap(`http://webapi.amap.com/maps?v=1.3&key=${MapKey}`, (data) => {
          console.log('=-=-=-=-=:', data)
        })
        await amap('http://webapi.amap.com/ui/1.0/main.js')
        this.initMap()
      }
    }
  }
}
</script>

<style scoped>
  .line {
    text-align: center;
  }
  .m-map{ min-width: 500px; min-height: 300px; position: relative; }
  .m-map .map{ width: 100%; height: 100%; }
  .m-map .search{ position: absolute; top: 10px; left: 10px; width: 285px; z-index: 1; }
  .m-map .search input{ width: 180px; border: 1px solid #ccc; line-height: 20px; padding: 5px; outline: none; }
  .m-map .search button{ line-height: 26px; background: #fff; border: 1px solid #ccc; width: 50px; text-align: center; }
  .m-map .result{ max-height: 300px; overflow: auto; margin-top: 10px; }
</style>

