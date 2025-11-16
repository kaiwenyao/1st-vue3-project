<script setup>
import { ElementPlus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, scrollbarProps } from "element-plus";
import { onMounted, ref, watch } from "vue";
import {
  queryPageApi,
  queryEmpList,
  addClazzApi,
  queryByIdApi,
  updateApi,
  deleteByIdApi,
} from "../../api/clazz";

const rules = ref({
  name: [
    { required: true, message: "请输入班级名称", trigger: "blur" },
    {
      min: 4,
      max: 30,
      message: "班级名称长度为4-30",
    },
  ],
  room: [
    {
      required: false,
      message: "",
      trigger: "blur",
    },
    {
      min: 1,
      max: 20,
      message: "教室名称长度为1-20",
    },
  ],
  beginDate: [
    {
      type: "date",
      required: true,
      message: "请选择开课时间",
      trigger: "change",
    },
  ],
  endDate: [
    {
      type: "date",
      required: true,
      message: "请选择结课时间",
      trigger: "change",
    },
  ],
  subject: [
    {
      required: true,
      message: "请选择学科",
      trigger: "change",
    },
  ],
});
const subjects = ref([
  { name: "java", value: 1 },
  { name: "前端", value: 2 },
  { name: "大数据", value: 3 },
  { name: "Python", value: 4 },
  { name: "Go", value: 5 },
  { name: "嵌入式", value: 6 },
]);
const searchClazz = ref({
  name: "",
  region: "",
  date: [],
  begin: "",
  end: "",
});
const clazz = ref({
  name: "",
  room: "",
  beginDate: "",
  endDate: "",
  masterId: "",
  subject: "",
});
const emps = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0); // 总记录数
const clazzList = ref([]);
const dialogFormVisible = ref(false);
const clazzFormRef = ref();
const dialogTitle = ref();
const search = async () => {
  const result = await queryPageApi(
    searchClazz.value.name,
    searchClazz.value.begin,
    searchClazz.value.end,
    currentPage.value,
    pageSize.value
  );
  if (result.code) {
    total.value = result.data.total;
    clazzList.value = result.data.rows;
  }
};
const clear = () => {
  // 清空
  searchClazz.value = {
    name: "",
    region: "",
    date: [],
    begin: "",
    end: "",
  };
};

const addClazzButton = () => {
  clazz.value = {
    name: "",
    room: "",
    beginDate: "",
    endDate: "",
    masterId: "",
    subject: "",
  };
  if (clazzFormRef.value) {
    clazzFormRef.value.resetFields();
  }
  dialogTitle.value = "添加班级";
  dialogFormVisible.value = true;
};
const handleSizeChange = (val) => {
  search();
};
const handleCurrentChange = (val) => {
  search();
};
const saveClazz = async () => {
  if (!clazzFormRef.value) return;
  clazzFormRef.value.validate(async (valid) => {
    if (valid) {
      let result;
      if (clazz.value.id) {
        // 更新
        result = await updateApi(clazz.value);
      } else {
        // 新增
        result = await addClazzApi(clazz.value);
      }
      if (result.code) {
        ElMessage.success("保存成功！");
        dialogFormVisible.value = false;
        search();
      } else {
        ElMessage.error(result.msg);
      }
    } else {
      ElMessage.error("表单校验不通过");
    }
  });
};
const edit = async (id) => {
  if (clazzFormRef.value) {
    clazzFormRef.value.resetFields();
  }
  const result = await queryByIdApi(id);
  if (result.code) {
    clazz.value = result.data;
    dialogTitle.value = "修改班级";
    dialogFormVisible.value = true;
  }
};
const deleteById = (id) => {
  ElMessageBox.confirm("您确认删除该课程吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 确认
      const result = await deleteByIdApi(id);
      if (result.code) {
        ElMessage.success("删除成功");
        search();
      } else {
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage.info("您已取消删除");
    });
};
//监听函数 监听查询对象的变化
watch(
  () => searchClazz.value.date,
  (newVal, oldVal) => {
    if (newVal.length === 2) {
      searchClazz.value.begin = newVal[0];
      searchClazz.value.end = newVal[1];
    } else {
      searchClazz.value.begin = "";
      searchClazz.value.end = "";
    }
  }
);
const queryAllEmps = async () => {
  const result = await queryEmpList();
  if (result.code) {
    emps.value = result.data;
  }
};
onMounted(() => {
  queryAllEmps();
  search();
});

</script>

<template>
  <h2>班级管理</h2>
  <!-- 搜索栏 -->
  <div class="container">
    <el-form :inline="true" :model="searchClazz" class="demo-form-inline">
      <el-form-item label="班级名称">
        <el-input
          v-model="searchClazz.name"
          placeholder="请输入班级名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="结课时间">
        <el-date-picker
          v-model="searchClazz.date"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="default"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 新增班级按钮 -->
  <el-button type="primary" @click="addClazzButton">+新增班级</el-button>
  <!-- 对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="500">
    <el-form ref="clazzFormRef" :rules="rules" :model="clazz">
      <el-form-item label="班级名称" :label-width="formLabelWidth" prop="name">
        <el-input
          v-model="clazz.name"
          placeholder="请输入班级名称"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="班级教室" :label-width="formLabelWidth" prop="room">
        <el-input
          v-model="clazz.room"
          placeholder="请填写班级教室"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item
        label="开课时间"
        :label-width="formLabelWidth"
        prop="beginDate"
      >
        <el-date-picker
          v-model="clazz.beginDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择开课时间"
          :size="size"
        />
      </el-form-item>
      <el-form-item
        label="结课时间"
        :label-width="formLabelWidth"
        prop="endDate"
      >
        <el-date-picker
          v-model="clazz.endDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择结课时间"
          :size="size"
        />
      </el-form-item>
      <el-form-item label="班主任" :label-width="formLabelWidth">
        <el-select v-model="clazz.masterId" placeholder="请选择班主任">
          <el-option
            v-for="emp in emps"
            :key="emp.id"
            :label="emp.name"
            :value="emp.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学科" :label-width="formLabelWidth" prop="subject">
        <el-select v-model="clazz.subject" placeholder="请选择学科">
          <el-option
            v-for="subject in subjects"
            :key="subject.value"
            :label="subject.name"
            :value="subject.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveClazz"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 课程列表 -->
  <div class="container">
    <el-table :data="clazzList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column
        prop="name"
        label="班级名称"
        width="210"
        align="center"
      />
      <el-table-column
        prop="room"
        label="班级教室"
        width="120"
        align="center"
      />
      <el-table-column
        prop="masterName"
        label="班主任"
        width="120"
        align="center"
      />
      <el-table-column
        prop="beginDate"
        label="开课时间"
        width="120"
        align="center"
      />
      <el-table-column
        prop="endDate"
        label="结课时间"
        width="120"
        align="center"
      />
      <el-table-column prop="status" label="状态" width="120" align="center" />
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
            @click="deleteById(scope.row.id)"
          >
            <el-icon> <Delete /> </el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
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
  margin: 10px 0;
}
</style>
