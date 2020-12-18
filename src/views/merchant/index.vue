<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.title" placeholder="商铺名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getUsers">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      v-loading="listLoading"
      :data="merchants"
      highlight-current-row
      style="width: 100%;"
      @selection-change="selectsChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="60" />
      <el-table-column prop="title" label="名称" width="120" />
      <el-table-column prop="phone" label="电话" width="100" />
      <el-table-column prop="description" label="描述" width="100" />
      <el-table-column prop="address" label="地址" min-width="180" />
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <router-link :to="{path:'/shop/add', query: {id: scope.row.id}}"><el-button size="small">添加商铺</el-button></router-link>
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
        <el-form-item label="名称" prop="title">
          <el-input v-model="editForm.title" auto-complete="off" />
        </el-form-item>
        <el-form-item label="商户描述">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="商户状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择商户状态">
            <el-option
              v-for="(label, value) in statusLabel"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
          0:关闭, 1:开通
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click.native="editSubmit">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible">
      <el-form ref="addForm" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="名称" prop="title">
          <el-input v-model="addForm.title" auto-complete="off" />
        </el-form-item>
        <el-form-item label="电话" prop="title">
          <el-input v-model="addForm.phone" auto-complete="off" />
        </el-form-item>
        <el-form-item label="商户描述">
          <el-input v-model="addForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button :loading="addLoading" type="primary" @click.native="addSubmit">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import { getList, remove, edit, add } from '../../api/merchant'

export default {

  data() {
    return {
      filters: {
        title: ''
      },
      merchants: [],
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
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ]
      },
      statusLabel: {
        1: '开通',
        0: '关闭'
      },
      // 编辑界面数据
      editForm: {
        id: 0,
        merchantId: 0,
        title: '',
        phone: '',
        address: '',
        address_description: '',
        description: '',
        status: 1,
        detailDescribe: ''
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
      },
      // 新增界面数据
      addForm: {
        title: '这是测试用的',
        phone: '18622839221',
        address: '一中门口',
        status: 1,
        address_description: 'KFC旁边',
        description: '来了就不想走的店',
        detailDescribe: '有料。'
      }

    }
  },
  mounted() {
    this.getMerchants()
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val
      this.getMerchants()
    },
    // 获取商户列表
    getMerchants() {
      const para = {
        page: this.page,
        title: this.filters.title
      }
      this.listLoading = true
      getList(para).then((res) => {
        console.log(res)
        this.total = res.data.total
        this.merchants = res.data.rows
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
          // this.getUsers()
        })
      }).catch(() => {

      })
    },
    // 显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true
      this.editForm = Object.assign({}, row)
    },
    // 显示新增界面
    handleAdd: function() {
      this.addFormVisible = true
      this.addForm = {
        title: '',
        address: '',
        address_description: '',
        description: '',
        detailDescribe: ''
      }
    },
    // 编辑
    editSubmit: function() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.editLoading = true
            // NProgress.start();
            const para = Object.assign({}, this.editForm)
            para.status = Number(para.status)
            edit(para).then((res) => {
              this.editLoading = false
              // NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              // this.getUsers()
            }).then(function(err) {
              console.log('err:', err)
            })
          })
        }
      })
    },
    // 新增
    addSubmit: function() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.addLoading = true
            this.addForm.status = Number(this.addForm.status)
            const para = Object.assign({}, this.addForm)
            add(para).then((res) => {
              this.addLoading = false
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['addForm'].resetFields()
              this.addFormVisible = false
              // this.getUsers()
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

<style scoped>
</style>
