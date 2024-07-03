import request from "@/utils/request";
import { NoteDTO } from "@/type/note"

/**
 * 
 * @param currentPage 
 * @param pageSize 
 * @returns 
 */
export const getRecommendNote = (currentPage: number, pageSize: number) => {
  return request<any>({
    url: `/web/es/note/getRecommendNote/${currentPage}/${pageSize}`, // mock接口
    method: "get",
  });
};

/**
 * 
 * @param currentPage 
 * @param pageSize 
 * @param data 
 * @returns 
 */
export const getNoteByDTO = (currentPage: number, pageSize: number, data: NoteDTO) => {
  return request<any>({
    url: `/web/es/note/getNoteByDTO/${currentPage}/${pageSize}`, // mock接口
    method: "post",
    data: data
  });
};

export const getCategoryAgg = (data: NoteDTO) => {
  return request<any>({
    url: `/web/es/note/getCategoryAgg`, // mock接口
    method: "post",
    data: data
  });
};

/**
 * 
 * @param keyword 
 * @returns 
 */
export const getRecordByKeyWord = (keyword: string) => {
  return request<any>({
    url: `/web/es/record/getRecordByKeyWord`, // mock接口
    method: "get",
    params: {
      keyword
    }
  });
};

/**
 * 
 * @returns 
 */
export const getHotRecord = () => {
  return request<any>({
    url: `web/es/record/getHotRecord`, // mock接口
    method: "get",
  });
};

/**
 * 
 * @param keyword 
 * @returns 
 */
export const addRecord = (keyword: string) => {
  return request<any>({
    url: `/web/es/record/addRecord`, // mock接口
    method: "get",
    params: {
      keyword
    }
  });
};