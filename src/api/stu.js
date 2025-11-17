import { queryClazzListApi } from "./clazz";
import request from "../utils/request";
// 查询所有班级 回显到学生的搜索栏
export const queryAllClazzsApi = () => queryClazzListApi();
// 分页查询
export const queryPageApi = (name, degree, clazzId, page, pageSize) =>
  request.get(
    `/students?name=${name}&degree=${degree}&clazzId=${clazzId}&page=${page}&pageSize=${pageSize}`
  );
// 新增学员
export const addApi = (student) => {
  return request.post("/students", student);
};
//删除学员
export const deleteByIdApi = (ids) => {
  return request.delete(`/students/${ids}`);
};
// 按照id查询
export const queryByIdApi = (id) => {
  return request.get(`/students/${id}`);
};
// 修改学员
export const updateByIdApi = (student) => {
  return request.put("/students", student);
};
