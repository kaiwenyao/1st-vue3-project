<script setup>
import { onMounted, ref } from "vue";
import {
  queryAllClazzsApi,
  queryPageApi,
  addApi,
  deleteByIdApi,
  queryByIdApi,
  updateByIdApi,
} from "../../api/stu";
import { ElMessage, ElMessageBox } from "element-plus";
const degrees = ref([
  { name: "初中", value: 1 },
  { name: "高中", value: 2 },
  { name: "大专", value: 3 },
  { name: "本科", value: 4 },
  { name: "硕士", value: 5 },
  { name: "博士", value: 6 },
]);
const currentPage = ref(1);
const pageSize = ref(10);
const clazzs = ref([]);
const total = ref();
const students = ref([]);
const dialogFormVisible = ref(false);
const studentFormRef = ref();
const selectedIds = ref([]);
const dialogTitle = ref("");
const rules = ref({
  name: [
    { required: true, message: "请输入学员姓名", trigger: "blur" },
    {
      min: 2,
      max: 10,
      message: "姓名长度为2-10",
    },
  ],
  no: [
    { required: true, message: "请输入学号", trigger: "blur" },
    { min: 10, max: 10, message: "学号长度为10位" },
  ],
  gender: [{ required: true, message: "请输入性别", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入手机号" },
    { min: 11, max: 11, message: "手机号长度为11位" },
  ],
  idCard: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    { min: 18, max: 18, message: "身份证长度为18位" },
  ],
  isCollege: [{ required: true, message: "请选择" }],
  degree: [{ required: true, message: "请选择" }],
  address: [
    { required: false },
    {
      min: 0,
      max: 100,
      message: "地址长度需要小于100",
    },
  ],
  clazzId: [{ required: true, message: "请选择班级" }],
});

const student = ref({
  name: "",
  no: "",
  gender: "",
  phone: "",
  idCard: "",
  isCollege: "",
  address: "",
  degree: "",
  graduationDate: "",
  clazzId: "",
});
const searchStu = ref({
  name: "",
  degree: "",
  clazzId: "",
});
const save = async () => {
  if (!studentFormRef.value) return;
  studentFormRef.value.validate(async (valid) => {
    if (valid) {
      let result;
      if (student.value.id) {
        // 修改
        result = await updateByIdApi(student.value);
      } else {
        // 添加
        result = await addApi(student.value);
      }
      if (result.code) {
        ElMessage.success("保存成功！");
        search();
        dialogFormVisible.value = false;
      } else {
        ElMessage.error(result.msg);
      }
    } else {
      ElMessage.error("表单校验不通过！");
    }
  });
};
const addStuBtn = () => {
  student.value = {
    name: "",
    no: "",
    gender: "",
    phone: "",
    idCard: "",
    isCollege: "",
    address: "",
    degree: "",
    graduationDate: "",
    clazzId: "",
  };
  if (studentFormRef.value) {
    studentFormRef.value.resetFields();
  }
  dialogTitle.value = "添加学员";
  dialogFormVisible.value = true;
};
const deleteStuBtn = async () => {
  ElMessageBox.confirm("您确认删除吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 确认删除
      if (selectedIds.value && selectedIds.value.length > 0) {
        const result = await deleteByIdApi(selectedIds.value);
        if (result.code) {
          ElMessage.success("删除员工成功！");
          search();
        } else {
          ElMessage.error("删除员工失败");
        }
      } else {
        ElMessage.info("您没有选择任何记录");
      }
    })
    .catch(() => {
      ElMessage.info("您已取消删除");
    });
};
const edit = async (id) => {
  const result = await queryByIdApi(id);
  if (result.code) {
    // 成功
    student.value = result.data;
    dialogTitle.value = "修改学员";
    dialogFormVisible.value = true;
  }
};
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
  // console.log(selectedIds.value);
};
const search = async () => {
  const result = await queryPageApi(
    searchStu.value.name,
    searchStu.value.degree,
    searchStu.value.clazzId,
    currentPage.value,
    pageSize.value
  );
  if (result.code) {
    total.value = result.data.total;
    students.value = result.data.rows;
  }
};
const clear = () => {
  searchStu.value = {
    name: "",
    degree: "",
    clazzId: "",
  };
};
const queryAllClazzs = async () => {
  const result = await queryAllClazzsApi();
  if (result.code) {
    clazzs.value = result.data;
  }
};
const handleSizeChange = () => {
  search();
};
const handleCurrentChange = () => {
  search();
};
onMounted(() => {
  search();
  queryAllClazzs();
});
</script>

<template>
  <h2>学员管理</h2>
  <!-- 搜索栏 -->
  <div class="container">
    <el-form :inline="true" :model="searchStu" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input
          v-model="searchStu.name"
          placeholder="请输入学生姓名"
          clearable
        />
      </el-form-item>
      <el-form-item label="最高学历">
        <el-select v-model="searchStu.degree" placeholder="请选择" clearable>
          <el-option
            v-for="degree in degrees"
            :key="degree.value"
            :label="degree.name"
            :value="degree.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属班级">
        <el-select v-model="searchStu.clazzId" placeholder="请选择" clearable>
          <el-option
            v-for="clazz in clazzs"
            :key="clazz.id"
            :label="clazz.name"
            :value="clazz.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 添加学员按钮 -->
  <div class="container">
    <el-button type="primary" @click="addStuBtn">+添加学员</el-button>
    <el-button type="primary" @click="deleteStuBtn">-批量删除</el-button>
  </div>
  <!-- 对话框 -->
  <div class="container">
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      label-width="80px"
    >
      <el-form :rules="rules" ref="studentFormRef" :model="student">
        <!-- 第一行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="student.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" prop="no">
              <el-input v-model="student.no" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第二行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="student.gender" placeholder="请选择">
                <el-option label="男" value="1" />
                <el-option label="女" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="student.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第三行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="student.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否院校学员" prop="isCollege">
              <el-select v-model="student.isCollege" placeholder="请选择">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系地址" prop="address">
              <el-input
                v-model="student.address"
                placeholder="请输入联系地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高学历" prop="degree">
              <el-select v-model="student.degree" placeholder="请选择">
                <el-option label="初中" value="1" />
                <el-option label="高中" value="2" />
                <el-option label="大专" value="3" />
                <el-option label="本科" value="4" />
                <el-option label="硕士" value="5" />
                <el-option label="博士" value="6" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="毕业时间" prop="graduatinDate">
              <el-date-picker
                v-model="student.graduationDate"
                type="date"
                placeholder="请选择"
                size="default"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属班级" prop="clazzId">
              <el-select v-model="student.clazzId" placeholder="请选择">
                <el-option
                  v-for="clazz in clazzs"
                  :key="clazz.id"
                  :label="clazz.name"
                  :value="clazz.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="save"> 保存 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <!-- 显示表格 -->

  <el-table
    @selection-change="handleSelectionChange"
    :data="students"
    border
    style="width: 100%"
  >
    <el-table-column type="selection" width="55" align="center" />
    <el-table-column prop="name" label="姓名" width="120" align="center" />
    <el-table-column prop="no" label="学号" width="120" align="center" />
    <el-table-column prop="clazzName" label="班级" width="180" align="center" />
    <el-table-column label="性别" width="60" align="center">
      <template #default="scope">
        {{ scope.row.gender == 1 ? "男" : "女" }}
      </template>
    </el-table-column>
    <el-table-column prop="phone" label="手机号" width="120" align="center" />
    <el-table-column label="最高学历" width="120" align="center">
      <template #default="scope">
        <span v-if="scope.row.degree == 1">初中</span>
        <span v-else-if="scope.row.degree == 2">高中</span>
        <span v-else-if="scope.row.degree == 3">大专</span>
        <span v-else-if="scope.row.degree == 4">本科</span>
        <span v-else-if="scope.row.degree == 5">硕士</span>
        <span v-else-if="scope.row.degree == 6">博士</span>
        <span v-else>其他</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="violationCount"
      label="违纪次数"
      width="120"
      align="center"
    />
    <el-table-column
      prop="violationScore"
      label="违纪扣分"
      width="120"
      align="center"
    />
    <el-table-column
      prop="updateTime"
      label="最后操作时间"
      width="180"
      align="center"
    />
    <el-table-column label="操作" align="center">
      <template #default="scope">
        <el-button type="primary" size="small" @click="edit(scope.row.id)">
          <el-icon> <EditPen /> </el-icon>编辑
        </el-button>
        <el-button
          type="danger"
          size="small"
          @click="deleteStuBtn(scope.row.id)"
        >
          <el-icon> <Delete /> </el-icon>删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页条 -->
  <div class="container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      size="default"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.container {
  margin: 10px 0px;
}
</style>
