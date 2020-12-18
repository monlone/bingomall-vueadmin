<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.title" placeholder="商铺名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @:click="getBanners">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      v-loading="listLoading"
      :data="banners"
      highlight-current-row
      style="width: 100%;"
      @selection-change="selectsChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="60" />
      <el-table-column prop="title" label="名称" width="150" />
      <el-table-column prop="id" label="店铺id" width="120" />
      <el-table-column prop="to_url" label="要跳转的url" width="150" />
      <el-table-column prop="content" label="描述" width="200" />
      <el-table-column prop="begin_at" label="开始时间" width="120" sortable />
      <el-table-column prop="end_at" label="结束时间" width="120" sortable />
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
      <el-form ref="editForm" :model="editForm" label-width="120px" :rules="editFormRules">
        <el-form-item label="banner id">
          <el-input v-model="editForm.id" :readonly="true" />
        </el-form-item>
        <el-form-item label="店铺id">
          <el-input v-model="editForm.id" :readonly="true" />
        </el-form-item>
        <el-form-item label="banner名称" prop="title">
          <el-input v-model="editForm.title" auto-complete="off" />
        </el-form-item>
        <el-form-item label="描述" prop="content">
          <el-input v-model="editForm.content" type="textarea" />
        </el-form-item>
        <!--        <el-form-item label="图片lurl" prop="imageUrl">-->
        <!--          <el-input v-for="(item,i) of editForm.imageUrl" :key="i" v-model="editForm.imageUrl[i]" type="text" />-->
        <!--          <button @click="onAdd">添加</button>-->
        <!--        </el-form-item>-->
        <el-form-item label="图片lurl" prop="imageUrl">
          <el-input v-model="editForm.imageUrl" type="text" />
        </el-form-item>
        <el-form-item label="有效时间">
          <el-col :span="11">
            <el-date-picker
              v-model="editForm.begin_at"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              :picker-options="pickerOptions"
            />
          </el-col>
          <el-col :span="2" class="line">-</el-col>
          <el-col :span="11">
            <el-date-picker
              v-model="editForm.end_at"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              :picker-options="pickerOptions"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="要跳转的url" prop="to_url">
          <el-input v-model="editForm.to_url" placeholder="要跳转的url" />
        </el-form-item>
        <el-form-item label="跳转类型">
          <el-select v-model="editForm.to_type" placeholder="请选择跳转类型">
            <el-option
              v-for="item in toTypeLabel"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="banner类型" prop="type">
          <el-select v-model="editForm.type" placeholder="请选择banner类型">
            <el-option
              v-for="item in typeLabel"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
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
import { getList, remove, edit } from '../../api/banner'

export default {
  data() {
    return {
      filters: {
        name: ''
      },
      banners: [],
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
      addLoading: false,
      toTypeLabel: [
        { key: 1, name: 'web' },
        { key: 2, name: 'app' }
      ],
      typeLabel: [
        { key: 1, name: '平台' },
        { key: 2, name: '商户' }
      ],
      // 编辑界面数据
      editForm: {
        id: '',
        id: '',
        title: '',
        type: 2,
        to_url: '',
        to_type: 1,
        begin_at: Date(),
        end_at: Date(),
        content: '',
        imageUrl: ''
      },
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '明天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周后',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  mounted() {
    this.getBanners()
  },
  methods: {
    onAdd() {
      if (!this.editForm.imageUrl) {
        this.editForm.imageUrl = []
      }
      if (this.editForm.imageUrl.length >= 3) {
        this.$message({
          message: '只能添加3张',
          type: 'success'
        })
        return
      }
      this.editForm.imageUrl.push('')
    },
    handleCurrentChange(val) {
      this.page = val
      this.getBanners()
    },
    // 获取列表
    getBanners() {
      const para = {
        page: this.page,
        name: this.filters.name
      }
      this.listLoading = true
      getList(para).then((res) => {
        this.total = res.data.total;
        this.banners = res.data.rows
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
          this.getBanners()
        })
      }).catch(() => {

      })
    },
    // 显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true
      this.editForm = Object.assign({}, row)
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    // 编辑
    editSubmit: function() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.editLoading = true
            // NProgress.start()
            const beginAt = new Date(this.editForm.begin_at)
            const endAt = new Date(this.editForm.end_at)
            this.editForm.begin_at = beginAt.toISOString()
            this.editForm.end_at = endAt.toISOString()
            this.editForm.to_type = Number(this.editForm.to_type)
            this.editForm.type = Number(this.editForm.type)
            const para = Object.assign({}, this.editForm)
            edit(para).then((res) => {
              this.editLoading = false
              // NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['editForm'].resetFields()
              this.editFormVisible = false
              this.getBanners()
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

