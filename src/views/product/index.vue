<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.title" placeholder="商铺名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @:click="getProducts">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      v-loading="listLoading"
      :data="products"
      highlight-current-row
      style="width: 100%;"
      @selection-change="selectsChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="60" />
      <el-table-column prop="title" label="名称" width="120" />
      <el-table-column prop="description" label="描述" width="100" />
      <el-table-column prop="price" label="价格" width="100" />
      <el-table-column prop="discount" label="折扣" width="100" />
      <el-table-column prop="discount_user" label="用户返现" width="100" />
      <el-table-column prop="discount_platform" label="平台返现" width="100" />
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
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
        <el-form-item label="产品id">
          <el-input v-model="editForm.id" :readonly="true" />
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="editForm.title" auto-complete="off" />
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="editForm.type" placeholder="请选择产品类型">
            <el-option
              v-for="item in selectList"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品价格(单位:元)">
          <el-input v-model="editForm.price" />
        </el-form-item>
        <el-form-item label="产品折扣(%)">
          <el-input v-model="editForm.discount" />
        </el-form-item>
        <el-form-item label="用户返现(%)" prop="discount">
          <el-input v-model="editForm.discount_user" placeholder="用户购买此产品获得的返利（返现）" />
        </el-form-item>
        <el-form-item label="分销提成(%)" prop="discount_level">
          <el-input v-model="editForm.discount_level" placeholder="推广者的上级提成，从推广者身上扣钱 (如4:3 第一级4%,第二级3%)" />
        </el-form-item>
        <el-form-item label="平台收益(%)" prop="discount_platform">
          <el-input v-model="editForm.discount_platform" placeholder="平台自己的收益" />
        </el-form-item>
        <el-form-item label="购买须知">
          <el-input v-model="editForm.describe" type="textarea" />
        </el-form-item>
        <el-form-item label="产品详情图文介绍" prop="content">
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
import { getList, remove, edit } from '../../api/product'
import TinymceEditor from '../../components/Tinymce/tinymce-editor.vue'

export default {
  components: {
    TinymceEditor
  },
  data() {
    return {
      filters: {
        name: ''
      },
      products: [],
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
        price: [
          { required: true, min: 1, message: '请输入价格', trigger: 'blur' }
        ],
        imageUrl: [
          { required: true, message: '请输入url', trigger: 'blur' }
        ]
      },
      // 商品类型 1-实物商品要核销, 2-虚拟商品要核销，3-虚拟商品不用核销，4-实物商品要邮寄 5-实物商品不要邮寄
      selectList: [
        { key: 1, name: '实物商品' },
        { key: 2, name: '代金券' }
      ],
      // 编辑界面数据
      editForm: {
        id: '',
        shopId: '',
        title: '',
        address: '',
        discount: 85,
        discount_user: 5,
        discount_level: 5,
        discount_platform: 5,
        description: '',
        describe: '',
        begin_at: '',
        end_at: '',
        longitude: 0,
        latitude: 0,
        price: 0,
        detailDescribe: '',
        type: '1'
      }
    }
  },
  mounted() {
    this.getProducts()
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val
      this.getProducts()
    },
    // 获取列表
    getProducts() {
      const para = {
        page: this.page,
        name: this.filters.name
      }
      this.listLoading = true
      getList(para).then((res) => {
        console.log(res)
        this.total = res.data.total
        this.products = res.data.rows
        this.products.forEach(function(value, index, array) {
          value.price = value.price / 100
        })
        this.listLoading = false
      })
    },
    // 删除
    handleDel: function(index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        const para = { id: row.id }
        remove(para).then((res) => {
          this.listLoading = false
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getProducts()
        })
      }).catch(() => {

      })
    },
    // 显示编辑界面
    handleEdit: function(index, row) {
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
            this.editForm.price = Number(parseFloat(this.editForm.price).toFixed(2)) * 100
            this.editForm.type = Number(this.editForm.type)
            this.editForm.discount = Number(this.editForm.discount)
            this.editForm.discount_user = Number(this.editForm.discount_user)
            this.editForm.discount_level = Number(this.editForm.discount_level)
            this.editForm.discount_platform = Number(this.editForm.discount_platform)
            const para = Object.assign({}, this.editForm)
            delete para.createdAt
            delete para.updatedAt
            // para.birth = (!para.birth || para.birth === '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd')
            edit(para).then((res) => {
              this.editLoading = false
              // NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              this.getProducts()
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

