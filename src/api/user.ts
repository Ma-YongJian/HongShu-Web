import request from "@/utils/request";
import type { UserLogin } from "@/type/user";

/**
 * 
 * @param data 
 * @returns 
 */
export const login = (data: any) => {
  return request<any>({
    url: "/web/auth/login", // mock接口
    method: "post",
    data,
  });
};

/**
 * 
 * @param deptId 
 * @param file 
 * @returns 
 */
export function importFile(deptId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request({
    url: "/api/v1/users/_import",
    method: "post",
    params: { deptId: deptId },
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/**
 * 
 * @param accessToken 
 * @returns 
 */
export const getUserInfoByToken = (accessToken: string) => {
  return request<any>({
    url: "/web/auth/getUserInfoByToken", // mock接口
    method: "get",
    params: {
      accessToken,
    },
  });
};

/**
 * 
 * @param refreshToken 
 * @returns 
 */
export const refreshToken = (refreshToken: string) => {
  return request<any>({
    url: `/web/auth/refreshToken`, // mock接口
    method: "get",
    params: {
      refreshToken,
    },
  });
};

/**
 * 
 * @param data 
 * @returns 
 */
export const loginByCode = (data: UserLogin) => {
  return request<any>({
    url: "/web/auth/loginByCode", // mock接口
    method: "post",
    data,
  });
};

/**
 * 
 * @param currentPage 
 * @param pageSize 
 * @param userId 
 * @param type 
 * @returns 
 */
export const getTrendByUser = (currentPage:number,pageSize:number,userId:string,type:number) => {
  return request<any>({
    url: `/web/user/getTrendByUser/${currentPage}/${pageSize}`, // mock接口
    method: "get",
    params: {
      userId,
      type
    },
  });
};

/**
 * 
 * @param userId 
 * @returns 
 */
export const getUserById = (userId:string) => {
  return request<any>({
    url: `/web/user/getUserById`, // mock接口
    method: "get",
    params: {
      userId
    },
  });
};

/**
 * 
 * @param userId 
 * @returns 
 */
export const loginOut = (userId:string) => {
  return request<any>({
    url: `/web/auth/loginOut`, // mock接口
    method: "get",
    params: {
      userId
    },
  });
};

export const updateUser = (data: any) => {
  return request<any>({
    url: "/web/user/updateUser", // mock接口
    method: "post",
    data,
  });
};

export const getUserByKeyword = (currentPage: number, pageSize: number, keyword: string) => {
  return request<any>({
    url: `/web/user/getUserByKeyword/${currentPage}/${pageSize}`, // mock接口
    method: "get",
    params: {
      keyword
    },
  });
};

