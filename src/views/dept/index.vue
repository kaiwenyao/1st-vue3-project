<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { queryAllApi, addApi, queryByIdApi, updateApi, deleteByIdApi } from '../../api/dept';
import { ElMessage, ElMessageBox } from 'element-plus'

onMounted(() => {
  search();
})

const search = async () => {
  const result = await queryAllApi();
  if (result.code) { // 隐式类型转换。0 -> false, 其他数字都是true
    deptList.value = result.data;
  }
}

const deptList = ref([
]);

const dialogFormVisible = ref(false);
const dept = ref({ name: '' });
const save = async () => {
  // 表单校验
  if (!deptFormRef.value) return;
  deptFormRef.value.validate(async (valid) => { // 形参表示是否校验通过
    if (valid) { // 通过
      let result;
      if (dept.value.id) { // 修改
        result = await updateApi(dept.value);
      } else { // 新增
        result = await addApi(dept.value);
      }
      if (result.code) { // 成功
        // 提示信息
        ElMessage.success('操作成功');
        // 关闭对话框
        dialogFormVisible.value = false;
        //查询最新的数据
        search();
      } else {
        ElMessage.error(result.msg);
      }
    } else { // 不通过
      ElMessage.error("表单校验不通过！");
    }
  })
}
// 点击新增按钮时调用的函数
const addDept = () => {
  dialogFormVisible.value = true;
  formTitle.value = '新增部门';
  dept.value = { name: '' };
  // 重置表单校验
  if (deptFormRef.value) {
    deptFormRef.value.resetFields();
  }
}
const deptFormRef = ref();
const formTitle = ref('');
// 表单校验

const rules = ref({
  name: [
    { required: true, message: '部门名称必须填写', trigger: 'blur' },
    { min: 2, max: 10, message: '部门名称的长度应该在2-10位', trigger: 'blur' },
  ],
})
const edit = async (id) => {
  formTitle.value = "修改部门";
  if (deptFormRef.value) {
    deptFormRef.value.resetFields();
  }
  const result = await queryByIdApi(id);
  if (result.code) {
    dialogFormVisible.value = true;
    dept.value = result.data;
    console.log(dept);
    console.log(dept.value);
  }
}
const delById = async (id) => {
  // 弹出确认框
  ElMessageBox.confirm(
    '您确认删除该部门吗？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await deleteByIdApi(id);
      if (result.code) {
        ElMessage.success("删除成功！");
        search();
      } else {
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage.info("您已取消删除");
    })
}
</script>

<template>
  <h1>部门管理</h1>
  <div class="container">
    <el-button type="primary" @click="addDept"> + 新增部门</el-button>
  </div>
  <!-- 表格 区域  -->
  <div class="container">
    <el-table :data="deptList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100" align="center" />
      <el-table-column prop="name" label="部门名称" width="260" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center" />
      <el-table-column prop="address" label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)"> <el-icon>
              <EditPen />
            </el-icon>编辑 </el-button>
          <el-button type="danger" size="small" @click="delById(scope.row.id)"> <el-icon>
              <Delete />
            </el-icon>删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- dialog对话框区域 -->
  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" label-width="80px" prop="name">
        <el-input v-model="dept.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>
.container {
  margin: 10px 0px;
}
</style>
