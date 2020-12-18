<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.title" placeholder="商铺名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getShopLists">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      v-loading="listLoading"
      :data="shops"
      highlight-current-row
      style="width: 100%;"
      @selection-change="selectsChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="60" />
      <el-table-column prop="title" label="名称" width="120" />
      <el-table-column prop="phone" label="电话" width="100" />
      <el-table-column prop="description" label="描述" width="100" />
      <el-table-column prop="business_time" label="营业时间" width="120" />
      <el-table-column prop="address" label="地址" min-width="180" />
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <router-link :to="{path:'/product/add', query: {id: scope.row.id}}"><el-button size="small">添加商品</el-button></router-link>
          <router-link :to="{path:'/banner/add', query: {id: scope.row.id}}"><el-button size="small">添加banner</el-button></router-link>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!-- <el-button type="danger" :disabled="this.sels.length===0" @click="batchRemove">批量删除</el-button>-->
      <el-pagination
        layout="prev, pager, next"
        :page-size="15"
        :total="total"
        style="float:right;"
        @current-change="handleCurrentChange"
      />
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible">
      <el-form ref="editForm" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="商户id">
          <el-input v-model="editForm.merchantId" :readonly="true" />
        </el-form-item>
        <el-form-item label="店铺id">
          <el-input v-model="editForm.id" :readonly="true" />
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="editForm.title" auto-complete="off" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="editForm.order_weight" placeholder="填数字（如：1，2），值越大店铺越靠前" />
        </el-form-item>
        <el-form-item label="店铺状态">
          <el-select v-model="editForm.status" placeholder="请选择店铺状态">
            <el-option
              v-for="item in selectList"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editForm.address" type="textarea" />
        </el-form-item>
        <el-form-item label="地址描述">
          <el-input v-model="editForm.address_description" type="textarea" />
        </el-form-item>
        <el-form-item label="坐标">
          <el-input v-model="editForm.location" @change="setCoordinates" />
          <a target="_blank" href="//lbs.amap.com/api/javascript-api/example/map/click-to-get-lnglat/">点击获取坐标</a>
        </el-form-item>
        <el-form-item label="店铺logo">
          <el-input v-model="editForm.logo" placeholder="请填图片url地址" />
        </el-form-item>
        <el-form-item label="店铺图片url">
          <el-input v-model="editForm.imageUrl" placeholder="请填图片url地址" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="editForm.business_time" placeholder="请填写营业时间及说明" />
        </el-form-item>
        <el-form-item label="店铺详情图文介绍" prop="content">
          <tinymce-editor ref="editor" v-model="editForm.detailDescribe" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click.native="editSubmit">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import { getList, remove, edit } from '../../api/shop'
import TinymceEditor from '../../components/Tinymce/tinymce-editor.vue'

export default {
  components: {
    TinymceEditor
  },
  data() {
    return {
      filters: {
        title: ''
      },
      shops: [],
      total: 0,
      page: 1,
      listLoading: false,
      selects: [], // 列表选中列

      editFormVisible: false, // 编辑界面是否显示
      editLoading: false,
      editFormRules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '缺少商户id', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ]
      },
      selectList: [
        { key: 0, name: '店铺未开通' },
        { key: 1, name: '店铺可用' },
        { key: 2, name: '店铺冻结' },
        { key: 3, name: '永久封禁' },
        { key: 4, name: '其他' }
      ],
      // 编辑界面数据
      editForm: {
        id: 0,
        merchantId: 0,
        title: '',
        phone: '',
        address: '',
        address_description: '',
        description: '',
        begin_at: '',
        end_at: '',
        longitude: 0,
        latitude: 0,
        detailDescribe: '',
        Coordinates: null,
        business_time: '',
        logo: '',
        location: '',
        order_weight: 1
      },
      addFormVisible: false, // 新增界面是否显示
      addLoading: false,
      addFormRules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getShopLists()
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val
      this.getShopLists()
    },
    setCoordinates(val) {
      let coordinates = []
      coordinates = val.split(',')
      this.editForm.longitude = coordinates[0]
      this.editForm.latitude = coordinates[1]
    },
    see(e) {
      window.location.href = e
    },
    // 获取列表
    getShopLists() {
      const para = {
        page: this.page,
        title: this.filters.title
      }
      this.listLoading = true
      getList(para).then((res) => {
        this.total = res.data.total;
        this.shops = res.data.rows
        this.listLoading = false
      })
    },
    // 删除
    handleDel: function(index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        // this.listLoading = true
        const para = { id: row.id }
        remove(para).then((res) => {
          this.listLoading = false
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getShopLists()
        })
      }).catch(() => {

      })
    },
    // 显示编辑界面
    handleEdit: function(index, row) {
      row.location = row.longitude + ',' + row.latitude
      this.editFormVisible = true
      this.editForm = Object.assign({}, row)
    },
    // 编辑
    editSubmit: function() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.editLoading = true
            // NProgress.start();
            const para = Object.assign({}, this.editForm)
            para.Coordinates = { latitude: Number(para.latitude), longitude: Number(para.longitude) }
            // para.birth = (!para.birth || para.birth === '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd')
            para.longitude = Number(para.longitude)
            para.latitude = Number(para.latitude)
            para.order_weight = Number(para.order_weight)
            delete para.createdAt
            delete para.updatedAt
            edit(para).then((res) => {
              this.editLoading = false
              // NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              this.getShopLists()
            }).then(function(err) {
              console.log('err:', err)
            })
          })
        }
      })
    },

    selectsChange: function(selects) {
      this.selects = selects
    }
  }
}

</script>

