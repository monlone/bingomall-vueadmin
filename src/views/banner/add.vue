<template>
  <div class="app-container">
    <el-form ref="addForm" :model="addForm" label-width="120px" :rules="addFormRules">
      <el-form-item label="店铺id" prop="id">
        <el-input v-model="addForm.id" :readonly="true" />
      </el-form-item>
      <el-form-item label="banner名称" prop="title">
        <el-input v-model="addForm.title" auto-complete="off" />
      </el-form-item>
      <el-form-item label="描述" prop="content">
        <el-input v-model="addForm.content" type="textarea" />
      </el-form-item>
      <el-form-item label="图片lurl" prop="imageUrl">
        <el-input v-model="addForm.imageUrl" type="text" />
      </el-form-item>
      <el-form-item label="要跳转的url" prop="to_url">
        <el-input v-model="addForm.to_url" placeholder="要跳转的url" />
      </el-form-item>
      <el-form-item label="跳转类型">
        <el-select v-model="addForm.to_type" placeholder="请选择跳转类型">
          <el-option
            v-for="item in toTypeLabel"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="banner类型" prop="type">
        <el-select v-model="addForm.type" placeholder="请选择banner类型">
          <el-option
            v-for="item in typeLabel"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="addLoading" type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { add } from '../../api/banner'

export default {
  components: {
  },
  data() {
    return {
      searchKey: '',
      placeSearch: null,
      addForm: {
        id: '',
        title: '',
        type: 2,
        to_url: '',
        begin_at: null,
        end_at: null,
        content: '',
        imageUrl: '',
        to_type: 1
      },
      toTypeLabel: [
        { key: 1, name: 'web' },
        { key: 2, name: 'app' }
      ],
      typeLabel: [
        { key: 1, name: '平台' },
        { key: 2, name: '商户' }
      ],
      addLoading: false,
      addFormRules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        imageUrl: [
          { required: true, message: '请输入图片url', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '店铺id不能为空', trigger: 'blur' }
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
    console.log('this.$route.id:::', this.$route.query.id)
  },
  methods: {
    onAdd() {
      if (this.addForm.imageUrl.length >= 3) {
        this.$message({
          message: '只能添加3张',
          type: 'error'
        })
        return
      }
      this.addForm.imageUrl.push('')
    },
    onSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.addLoading = true
            this.addForm.to_type = Number(this.addForm.to_type)
            this.addForm.type = Number(this.addForm.type)
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
    }
  }
}
</script>

