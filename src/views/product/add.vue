<template>
  <div class="app-container">
    <el-form ref="addForm" :model="addForm" label-width="130px" :rules="addFormRules">
      <el-form-item label="店铺id">
        <el-input v-model="addForm.shopId" :readonly="true" />
      </el-form-item>
      <el-form-item label="名称" prop="title">
        <el-input v-model="addForm.title" auto-complete="off" />
      </el-form-item>
      <el-form-item label="产品描述" prop="description">
        <el-input v-model="addForm.description" type="textarea" />
      </el-form-item>
      <el-form-item label="产品类型">
        <el-select v-model="addForm.type" placeholder="请选择产品类型">
          <el-option
            v-for="item in selectList"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品价格(单位:元)" prop="price">
        <el-input v-model="addForm.price" placeholder="商品价格" />
      </el-form-item>
      <el-form-item label="产品折扣(%)" prop="discount">
        <el-input v-model="addForm.discount" placeholder="商品折扣（平台和商家洽谈的折扣）" />
      </el-form-item>
      <el-form-item label="用户返现(%)" prop="discount">
        <el-input v-model="addForm.discount_user" placeholder="用户购买此产品获得的返利（返现）" />
      </el-form-item>
      <el-form-item label="分销提成(%)" prop="discount_level">
        <el-input v-model="addForm.discount_level" placeholder="推广者的上级提成，从推广者身上扣钱" />
      </el-form-item>
      <el-form-item label="平台收益(%)" prop="discount_platform">
        <el-input v-model="addForm.discount_platform" placeholder="平台自己的收益" />
      </el-form-item>
      <el-form-item label="商品图片" prop="imageUrl">
        <el-input v-model="addForm.imageUrl" placeholder="商品图片" />
      </el-form-item>
      <el-form-item label="产品详情图文介绍" prop="detailDescribe">
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
import { add, getList } from '../../api/product'

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
        id: 0,
        shopId: 0,
        title: '',
        description: '',
        describe: '',
        price: 0,
        detailDescribe: '产品有效期:购买当日起原则上1个月有效,同时平台也承诺可以一定程度的延期\n' +
          '优惠返现规则:消费者使用好玉米APP消费,搜索关注公众号好玉米后,会随机获得到一个现金红包,直接返现\n' +
          '温馨提示:\n' +
          '1.商户可能致电您,预约到店时间,请保持手机通畅\n' +
          '2.如果需要发票,请到店消费时向商户咨询\n' +
          '3.为了保证您的消费权益,如果遇到任何问题可以采用订单线上投诉和反馈\n' +
          '4.如果使用其他支付方式,导致纠纷,好玉米不承担任何责任,谢谢您的理解和支持',
        discount: 85,
        discount_user: 5,
        discount_level: 5,
        discount_platform: 5,
        imageUrl: '',
        type: 1
      },
      // 商品类型 1-实物商品要核销, 2-虚拟商品要核销，3-虚拟商品不用核销，4-实物商品要邮寄 5-实物商品不要邮寄
      selectList: [
        { key: 1, name: '实物商品' },
        { key: 2, name: '代金券' }
      ],
      products: [],
      total: 0,
      listLoading: false,
      addLoading: false,
      addFormRules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        shopId: [
          { required: true, message: '店铺id不能为空', trigger: 'blur' }
        ],
        price: [
          { required: true, min: 1, message: '价格不能为0', trigger: 'blur' }
        ],
        imageUrl: [
          { required: true, message: '', trigger: 'blur' }
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
    onSubmit() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            // this.addLoading = true
            this.addForm.price = Number(parseFloat(this.addForm.price).toFixed(2)) * 100
            this.addForm.type = Number(this.addForm.type)
            const para = Object.assign({}, this.addForm)
            add(para).then((res) => {
              this.addLoading = false
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$refs['addForm'].resetFields()
              this.getProducts()
            }).then(function(err) {
              console.log('err:', err)
            })
          })
        }
      })
    },
    getProducts() {
      const para = {
        page: this.page
      }
      this.listLoading = true
      getList(para).then((res) => {
        console.log(res)
        this.total = res.data.total;
        this.products = res.data.rows
        this.listLoading = false
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

<style scoped>
</style>

