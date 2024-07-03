import request from "@/utils/request";
/**
 * 获取树形分类数据
 * @returns 分类数据
 */
export const getCategoryTreeData = () => {
  return request<any>({
    url: "/web/category/getCategoryTreeData",
    method: "get",
  });
};
