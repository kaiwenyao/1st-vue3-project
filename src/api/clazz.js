import request from "../utils/request";
import { queryListApi } from "../api/emp";
// 分页查询
export const queryPageApi = (name, begin, end, page, pageSize) => {
  return request.get(
    `/clazzs?name=${name}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`
  );
};
// 查询班主任信息，回显到添加课程表格
// 写在emp的api中
export const queryEmpList = () => {
  return queryListApi();
};
// 新增
export const addClazzApi = (clazz) => {
  return request.post("/clazzs", clazz);
};
// 修改
export const updateApi = (clazz) => {
  return request.put("/clazzs", clazz);
};
// 根据id查询
export const queryByIdApi = (id) => {
  return request.get(`/clazzs/${id}`);
};
// 删除
export const deleteByIdApi = (id) => {
  return request.delete(`/clazzs/${id}`);
};
// 列表查询 list
export const queryClazzListApi = () => {
  return request.get("/clazzs/list");
}
